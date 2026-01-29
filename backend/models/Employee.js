const mongoose = require('mongoose');

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
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
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

// Compound indexes for common queries
employeeSchema.index({ department: 1, status: 1 });
employeeSchema.index({ fullName: 'text', email: 'text', department: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
