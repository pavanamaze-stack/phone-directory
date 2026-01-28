const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployee,
  getDepartments
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getEmployees);
router.get('/departments', protect, getDepartments);
router.get('/:id', protect, getEmployee);

module.exports = router;
