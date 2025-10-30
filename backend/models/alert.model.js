import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true
  },
  severity: {
    type: String,
    required: [true, 'Alert severity is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  coordinates: {
    type: [Number],
    required: [true, 'Alert coordinates are required'],
    validate: {
      validator: function (v) {
        return (
          v.length === 2 &&
          v[0] >= -180 &&
          v[0] <= 180 &&
          v[1] >= -90 &&
          v[1] <= 90
        );
      },
      message: 'Invalid coordinates format'
    }
  },
  radius: {
    type: Number,
    required: [true, 'Alert radius is required'],
    min: [0, 'Radius must be positive']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  recipients: [{
    agency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agency',
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency'
  }],
  expiresAt: {
    type: Date,
    required: [true, 'Alert expiration date is required']
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
alertSchema.index({ createdBy: 1 });
alertSchema.index({ 'recipients.agency': 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ expiresAt: 1 });
alertSchema.index({ coordinates: '2dsphere' });

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;
