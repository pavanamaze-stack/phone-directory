const express = require('express');
const router = express.Router();
const {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getUsers,
  createUser,
  updateUser,
  getUploadHistory,
  getUploadLog
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const { validateEmployee, validateCreateUser } = require('../middleware/validator');

// All routes require admin access
router.use(protect, authorize('ADMIN'));

// Employee management
router.post('/employees', validateEmployee, createEmployee);
router.put('/employees/:id', validateEmployee, updateEmployee);
router.delete('/employees/:id', deleteEmployee);

// User management
router.get('/users', getUsers);
router.post('/users', validateCreateUser, createUser);
router.put('/users/:id', updateUser);

// Upload history
router.get('/upload-history', getUploadHistory);
router.get('/upload-history/:id', getUploadLog);

module.exports = router;
