const csv = require('csv-parser');
const fs = require('fs');
const Employee = require('../models/Employee');
const UploadLog = require('../models/UploadLog');

// Fields: Name, Email, Phone, Ext Number, Direct Contact (DC), Job Title, Status – all optional
const HEADER_MAP = {
  name: 'name', fullname: 'name', 'full name': 'name', fullName: 'name',
  email: 'email', 'e-mail': 'email', mail: 'email',
  phone: 'phone', phonenumber: 'phone', 'phone number': 'phone', phoneNumber: 'phone', tel: 'phone',
  extnumber: 'extNumber', 'ext number': 'extNumber', extension: 'extNumber', ext: 'extNumber',
  directcontact: 'directContact', 'direct contact': 'directContact', 'direct contact (dc)': 'directContact', dc: 'directContact',
  jobtitle: 'jobTitle', 'job title': 'jobTitle', jobTitle: 'jobTitle', title: 'jobTitle',
  status: 'status'
};

const normalizeRowKeys = (row) => {
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    const k = (key != null && String(key).trim()) || '';
    if (k === '') continue;
    const normalized = HEADER_MAP[String(k).toLowerCase()] || k;
    out[normalized] = val;
  }
  return out;
};

const sanitizeInput = (value) => {
  if (value == null) return '';
  const s = String(value).trim();
  const dangerousChars = ['=', '+', '-', '@', '\t', '\r'];
  if (dangerousChars.some(char => s.startsWith(char))) {
    return s.replace(/^[=+\-@\t\r]/, '');
  }
  return s;
};

// Build employee object from row: only include columns that have non-empty values. No required fields.
const rowToEmployee = (normalizedRow) => {
  const out = {};
  for (const [key, val] of Object.entries(normalizedRow)) {
    const v = sanitizeInput(val);
    if (v !== '') out[key] = v;
  }
  if (!out.status) out.status = 'active';
  if (out.status !== 'active' && out.status !== 'inactive') out.status = 'active';
  return out;
};

// @desc    Upload CSV file – all columns optional; data is saved and will show in dashboard / manage employees
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

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ relaxColumnCount: true }))
        .on('data', (row) => {
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

            for (let i = 0; i < results.length; i++) {
              const employeeData = results[i];
              try {
                await Employee.create(employeeData, { runValidators: false });
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

            const uploadLog = await UploadLog.create({
              fileName: req.file.originalname,
              uploadedBy: req.user._id,
              totalRows: rowNumber,
              successfulRows,
              failedRows,
              errors: upsertErrors,
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
                  errors: uploadLog.errors.slice(0, 10)
                }
              }
            });

            resolve();
          } catch (error) {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            reject(error);
          }
        })
        .on('error', (error) => {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          reject(error);
        });
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    next(error);
  }
};
