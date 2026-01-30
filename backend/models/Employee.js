const mongoose = require('mongoose');

// Fields: Name, Email, Phone, Ext Number, Direct Contact (DC), Job Title, Status – all optional.
// Email: partial unique index – uniqueness only when a non-empty email exists; null/empty/missing allowed (multiple records).
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

// Partial unique index: only index documents that have a non-empty email; enforce uniqueness only then.
// Documents with null, missing, or empty email are not in this index, so multiple such records are allowed.
employeeSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $exists: true, $type: 'string', $gt: '' }
    }
  }
);

module.exports = mongoose.model('Employee', employeeSchema);
