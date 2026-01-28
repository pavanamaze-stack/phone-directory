const Employee = require('../models/Employee');
const User = require('../models/User');
const UploadLog = require('../models/UploadLog');

// @desc    Create employee
// @route   POST /api/admin/employees
// @access  Private/Admin
exports.createEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.create(req.body);

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

    employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
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

// @desc    Create user (Admin only)
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'USER',
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

// @desc    Update user (activate/deactivate)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { isActive, role } = req.body;

    // Prevent admin from deactivating themselves
    if (req.params.id === req.user._id.toString() && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
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
