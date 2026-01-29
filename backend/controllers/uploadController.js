const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Employee = require('../models/Employee');
const UploadLog = require('../models/UploadLog');
const Joi = require('joi');

// CSV row validation schema – no mandatory fields; all optional
const employeeSchema = Joi.object({
  fullName: Joi.string().trim().allow('').default(''),
  email: Joi.alternatives().try(
    Joi.string().trim().lowercase().valid(''),
    Joi.string().trim().lowercase().email()
  ).default(''),
  phoneNumber: Joi.string().trim().allow('').default(''),
  extension: Joi.string().trim().allow('').default(''),
  department: Joi.string().trim().allow('').default(''),
  jobTitle: Joi.string().trim().allow('').default(''),
  officeLocation: Joi.string().trim().allow('').default(''),
  status: Joi.string().valid('active', 'inactive').default('active')
}).options({ stripUnknown: true });

// Map common CSV header variations to schema keys (no mandatory fields)
const HEADER_MAP = {
  fullname: 'fullName', 'full name': 'fullName', fullName: 'fullName',
  email: 'email', 'e-mail': 'email',
  phonenumber: 'phoneNumber', 'phone number': 'phoneNumber', phone: 'phoneNumber', phoneNumber: 'phoneNumber',
  extension: 'extension', ext: 'extension',
  department: 'department', dept: 'department',
  jobtitle: 'jobTitle', 'job title': 'jobTitle', jobTitle: 'jobTitle',
  officelocation: 'officeLocation', 'office location': 'officeLocation', officeLocation: 'officeLocation',
  status: 'status'
};

const normalizeRowKeys = (row) => {
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    const normalized = HEADER_MAP[key.trim().toLowerCase()] || key.trim();
    out[normalized] = val;
  }
  return out;
};

// Sanitize input to prevent CSV injection
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some(char => value.startsWith(char))) {
    return value.replace(/^[=+\-@\t\r]/, '');
  }
  return value.trim();
};

// @desc    Upload CSV file
// @route   POST /api/upload/csv
// @access  Private/Admin
exports.uploadCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a CSV file'
      });
    }

    const filePath = req.file.path;
    const results = [];
    const errors = [];
    let rowNumber = 0;

    // Read and parse CSV file
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          rowNumber++;
          
          // Normalize headers and sanitize values
          const normalizedRow = normalizeRowKeys(row);
          const sanitizedRow = {};
          Object.keys(normalizedRow).forEach(key => {
            sanitizedRow[key] = sanitizeInput(normalizedRow[key]);
          });

          // Validate row (no mandatory fields)
          const { error, value } = employeeSchema.validate(sanitizedRow, {
            abortEarly: false,
            allowUnknown: true
          });

          if (error) {
            errors.push({
              row: rowNumber,
              message: error.details.map(d => d.message).join(', '),
              data: sanitizedRow
            });
          } else {
            results.push(value);
          }
        })
        .on('end', async () => {
          try {
            // Delete the uploaded file
            fs.unlinkSync(filePath);

            let successfulRows = 0;
            let failedRows = errors.length;
            const upsertErrors = [];

            // Bulk upsert employees (update if exists by email, insert if not). When email empty, insert only.
            for (const employeeData of results) {
              try {
                const clean = { ...employeeData };
                if (clean.email === '') clean.email = undefined;
                if (clean.fullName === '') clean.fullName = undefined;
                if (clean.phoneNumber === '') clean.phoneNumber = undefined;
                if (clean.department === '') clean.department = undefined;

                if (clean.email) {
                  await Employee.findOneAndUpdate(
                    { email: clean.email },
                    clean,
                    { upsert: true, new: true, runValidators: true }
                  );
                } else {
                  await Employee.create(clean);
                }
                successfulRows++;
              } catch (err) {
                failedRows++;
                upsertErrors.push({
                  row: results.indexOf(employeeData) + 1,
                  message: err.message,
                  data: employeeData
                });
              }
            }

            // Combine validation errors with upsert errors
            const allErrors = [...errors, ...upsertErrors];

            // Create upload log
            const uploadLog = await UploadLog.create({
              fileName: req.file.originalname,
              uploadedBy: req.user._id,
              totalRows: rowNumber,
              successfulRows,
              failedRows,
              errors: allErrors,
              status: failedRows === 0 ? 'completed' : (successfulRows > 0 ? 'partial' : 'failed')
            });

            res.json({
              success: true,
              message: `Upload completed: ${successfulRows} successful, ${failedRows} failed`,
              data: {
                uploadLog: {
                  _id: uploadLog._id,
                  fileName: uploadLog.fileName,
                  totalRows: uploadLog.totalRows,
                  successfulRows: uploadLog.successfulRows,
                  failedRows: uploadLog.failedRows,
                  status: uploadLog.status,
                  errors: uploadLog.errors.slice(0, 10) // Return first 10 errors
                }
              }
            });

            resolve();
          } catch (error) {
            // Clean up file if still exists
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
            reject(error);
          }
        })
        .on('error', (error) => {
          // Clean up file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(error);
        });
    });
  } catch (error) {
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
