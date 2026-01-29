const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const Employee = require('../models/Employee');
const UploadLog = require('../models/UploadLog');
const Joi = require('joi');

// CSV row validation schema
const employeeSchema = Joi.object({
  fullName: Joi.string().trim().required().messages({
    'string.empty': 'Full name is required',
    'any.required': 'Full name is required'
  }),
  email: Joi.string().email().trim().lowercase().required().messages({
    'string.email': 'Invalid email format',
    'string.empty': 'Email is required',
    'any.required': 'Email is required'
  }),
  phoneNumber: Joi.string().trim().required().messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required'
  }),
  extension: Joi.string().trim().allow(''),
  department: Joi.string().trim().required().messages({
    'string.empty': 'Department is required',
    'any.required': 'Department is required'
  }),
  jobTitle: Joi.string().trim().allow(''),
  officeLocation: Joi.string().trim().allow(''),
  status: Joi.string().valid('active', 'inactive').default('active')
});

// Sanitize input to prevent CSV injection
const sanitizeInput = (value) => {
  if (typeof value !== 'string') return value;
  // Remove potentially dangerous characters that could lead to CSV injection
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
          
          // Sanitize all values
          const sanitizedRow = {};
          Object.keys(row).forEach(key => {
            sanitizedRow[key.trim()] = sanitizeInput(row[key]);
          });

          // Validate row
          const { error, value } = employeeSchema.validate(sanitizedRow, {
            abortEarly: false
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

            // Bulk upsert employees (update if exists, insert if not)
            for (const employeeData of results) {
              try {
                await Employee.findOneAndUpdate(
                  { email: employeeData.email },
                  employeeData,
                  { upsert: true, new: true, runValidators: true }
                );
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
