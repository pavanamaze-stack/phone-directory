const Employee = require('../models/Employee');

// @desc    Get all employees with search, filter, sort, pagination
// @route   GET /api/employees
// @access  Private
exports.getEmployees = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};

    // Search
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { extNumber: searchRegex },
        { directContact: searchRegex },
        { jobTitle: searchRegex }
      ];
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by job title
    if (req.query.jobTitle) {
      query.jobTitle = req.query.jobTitle;
    }

    // Sort
    let sortBy = {};
    if (req.query.sort) {
      const sortField = req.query.sort;
      const sortOrder = req.query.order === 'desc' ? -1 : 1;
      sortBy[sortField] = sortOrder;
    } else {
      sortBy = { name: 1 }; // Default sort by name A-Z
    }

    // Execute query
    const employees = await Employee.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(query);

    res.json({
      success: true,
      data: {
        employees,
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

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: { employee }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job titles list (for filters)
// @route   GET /api/employees/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const jobTitles = await Employee.distinct('jobTitle').then((arr) => arr.filter(Boolean).sort());
    res.json({
      success: true,
      data: { departments: jobTitles }
    });
  } catch (error) {
    next(error);
  }
};
