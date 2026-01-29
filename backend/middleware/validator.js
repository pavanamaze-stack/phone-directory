const { body, validationResult } = require('express-validator');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Registration validation rules
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate
];

// Login validation rules
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// Employee validation rules – all columns optional, no required field enforcement
exports.validateEmployee = [
  body('fullName').optional().trim(),
  body('email').optional().trim().isEmail().withMessage('Invalid email when provided').normalizeEmail(),
  body('phoneNumber').optional().trim(),
  body('extension').optional().trim(),
  body('department').optional().trim(),
  body('jobTitle').optional().trim(),
  body('officeLocation').optional().trim(),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
  validate
];

// Admin create user validation rules
exports.validateCreateUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'USER']).withMessage('Role must be either ADMIN or USER'),
  validate
];

// Admin update user validation rules (all fields optional)
exports.validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'USER']).withMessage('Role must be either ADMIN or USER'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  validate
];
