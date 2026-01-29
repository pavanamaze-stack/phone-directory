const csv = require('csv-parser');
const fs = require('fs');
const Employee = require('../models/Employee');
const UploadLog = require('../models/UploadLog');

// Map common CSV header variations to schema keys. No mandatory fields – only columns with data are used.
const HEADER_MAP = {
  fullname: 'fullName', 'full name': 'fullName', fullName: 'fullName', name: 'fullName',
  email: 'email', 'e-mail': 'email', mail: 'email',
  phonenumber: 'phoneNumber', 'phone number': 'phoneNumber', phone: 'phoneNumber', phoneNumber: 'phoneNumber', tel: 'phoneNumber',
  extension: 'extension', ext: 'extension',
  department: 'department', dept: 'department',
  jobtitle: 'jobTitle', 'job title': 'jobTitle', jobTitle: 'jobTitle', title: 'jobTitle',
  officelocation: 'officeLocation', 'office location': 'officeLocation', officeLocation: 'officeLocation', location: 'officeLocation',
  status: 'status'
};

const normalizeRowKeys = (row) => {
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    const k = (key && key.trim()) || '';
    if (k === '') continue;
    const normalized = HEADER_MAP[k.toLowerCase()] || k;
    out[normalized] = val;
  }
  return out;
};

// Sanitize input to prevent CSV injection
const sanitizeInput = (value) => {
  if (value == null) return '';
  if (typeof value !== 'string') return String(value).trim();
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  let s = value.trim();
  if (dangerousChars.some(char => s.startsWith(char))) {
    s = s.replace(/^[=+\-@\t\r]/, '');
  }
  return s;
};

// Build employee object from row: only include columns that have non-empty values. No validation – empty fields ignored.
const rowToEmployee = (normalizedRow) => {
  const sanitized = {};
  Object.keys(normalizedRow).forEach(key => {
    const val = sanitizeInput(normalizedRow[key]);
    if (val !== '') sanitized[key] = val;
  });
  if (!sanitized.status) sanitized.status = 'active';
  if (sanitized.status !== 'active' && sanitized.status !== 'inactive') sanitized.status = 'active';
  return sanitized;
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
    let rowNumber = 0;

    // Read and parse CSV file
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (row) => {
          rowNumber++;
          const normalizedRow = normalizeRowKeys(row);
          const employeeData = rowToEmployee(normalizedRow);
          const keys = Object.keys(employeeData);
          const hasUserInfo = keys.some(k => k !== 'status') || (keys.length === 1 && keys[0] !== 'status');
          if (hasUserInfo) results.push(employeeData);
        })
        .on('end', async () => {
          try {
            fs.unlinkSync(filePath);

            let successfulRows = 0;
            let failedRows = 0;
            const upsertErrors = [];

            // Save each row: only columns with data are used. No mandatory checks. runValidators: false so format (e.g. email) is not enforced.
            for (let i = 0; i < results.length; i++) {
              const employeeData = results[i];
              try {
                if (employeeData.email) {
                  await Employee.findOneAndUpdate(
                    { email: employeeData.email },
                    employeeData,
                    { upsert: true, new: true, runValidators: false }
                  );
                } else {
                  await Employee.create(employeeData, { runValidators: false });
                }
                successfulRows++;
              } catch (err) {
                failedRows++;
                upsertErrors.push({
                  row: i + 1,
                  message: err.message,
                  data: employeeData
                });
              }
            }

            const allErrors = upsertErrors;

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
