const mongoose = require('mongoose');

// All columns optional so CSV upload and manual add work with empty fields
const employeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: false,
    trim: true,
    index: true,
    default: ''
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
    index: true
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    index: true,
    default: ''
  },
  extension: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: false,
    trim: true,
    index: true,
    default: ''
  },
  jobTitle: {
    type: String,
    trim: true
  },
  officeLocation: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ fullName: 'text', email: 'text', department: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
