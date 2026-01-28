const mongoose = require('mongoose');

const uploadLogSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalRows: {
    type: Number,
    default: 0
  },
  successfulRows: {
    type: Number,
    default: 0
  },
  failedRows: {
    type: Number,
    default: 0
  },
  errors: [{
    row: Number,
    message: String,
    data: mongoose.Schema.Types.Mixed
  }],
  status: {
    type: String,
    enum: ['completed', 'failed', 'partial'],
    default: 'completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('UploadLog', uploadLogSchema);
