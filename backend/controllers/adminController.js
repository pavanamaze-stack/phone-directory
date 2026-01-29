const Employee = require('../models/Employee');
const User = require('../models/User');
const UploadLog = require('../models/UploadLog');

// Strip empty strings to undefined so optional fields don't violate unique (e.g. email)
const sanitizeEmployeeBody = (body) => {
  const out = { ...body };
  ['fullName', 'email', 'phoneNumber', 'department'].forEach((key) => {
    if (out[key] !== undefined && typeof out[key] === 'string' && !out[key].trim()) {
      out[key] = undefined;
    }
  });
  return out;
};

// @desc    Create employee
// @route   POST /api/admin/employees
// @access  Private/Admin
exports.createEmployee = async (req, res, next) => {
  try {
    const body = sanitizeEmployeeBody(req.body);
    const employee = await Employee.create(body);

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/admin/employees/:id
// @access  Private/Admin
exports.updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const body = sanitizeEmployeeBody(req.body);
    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/admin/employees/:id
// @access  Private/Admin
exports.deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    await employee.deleteOne();

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create user (Admin only). No fields required; defaults used when omitted.
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const trimmedName = (name && typeof name === 'string' && name.trim()) || '';
    const trimmedEmail = (email && typeof email === 'string' && email.trim()) || '';
    const trimmedPassword = (password && typeof password === 'string' && password.trim()) || '';

    const finalName = trimmedName.length >= 2 ? trimmedName : 'User';
    const finalEmail = trimmedEmail && /^\S+@\S+\.\S+$/.test(trimmedEmail)
      ? trimmedEmail
      : `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}@placeholder.local`;
    const finalPassword = trimmedPassword.length >= 6 ? trimmedPassword : 'changeme';

    const userExists = await User.findOne({ email: finalEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name: finalName,
      email: finalEmail,
      password: finalPassword,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (name, role, active, password)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { isActive, role, name, password } = req.body;

    // Find user first so we can safely update password via pre-save hook
    const user = await User.findById(req.params.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    // Update allowed fields
    if (typeof name === 'string' && name.trim()) {
      user.name = name.trim();
    }

    if (typeof role === 'string') {
      user.role = role;
    }

    if (typeof isActive === 'boolean') {
      user.isActive = isActive;
    }

    // If password provided, set it so pre-save hook hashes it
    if (typeof password === 'string' && password.length) {
      user.password = password;
    }

    await user.save();

    const sanitizedUser = user.toJSON();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: sanitizedUser }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upload history
// @route   GET /api/admin/upload-history
// @access  Private/Admin
exports.getUploadHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const uploads = await UploadLog.find()
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await UploadLog.countDocuments();

    res.json({
      success: true,
      data: {
        uploads,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get upload log details
// @route   GET /api/admin/upload-history/:id
// @access  Private/Admin
exports.getUploadLog = async (req, res, next) => {
  try {
    const uploadLog = await UploadLog.findById(req.params.id)
      .populate('uploadedBy', 'name email');

    if (!uploadLog) {
      return res.status(404).json({
        success: false,
        message: 'Upload log not found'
      });
    }

    res.json({
      success: true,
      data: { uploadLog }
    });
  } catch (error) {
    next(error);
  }
};
