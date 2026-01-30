const mongoose = require('mongoose');

// Fields: Name, Email, Phone, Ext Number, Direct Contact (DC), Job Title, Status – all optional
const employeeSchema = new mongoose.Schema({
  name: {
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
  phone: {
    type: String,
    required: false,
    trim: true,
    index: true,
    default: ''
  },
  extNumber: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  directContact: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  jobTitle: {
    type: String,
    required: false,
    trim: true,
    default: ''
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

employeeSchema.index({ status: 1 });
employeeSchema.index({ name: 'text', email: 'text', jobTitle: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
