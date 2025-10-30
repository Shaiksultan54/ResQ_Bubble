import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.length === 2 && 
               typeof v[0] === 'number' && typeof v[1] === 'number' &&
               v[0] >= -180 && v[0] <= 180 && // longitude
               v[1] >= -90 && v[1] <= 90;     // latitude
      },
      message: 'Coordinates must be [longitude, latitude] with valid ranges'
    }
  }
}, { _id: false });

const agencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Fire Department', 'Hospital', 'Police', 'NGO', 'Government', 'Military', 'Other'],
    required: true
  },
  contactEmail: {
    type: String,
    required: [true, 'Contact email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  location: {
    type: locationSchema,
    required: true,
    index: '2dsphere' // For geospatial queries
  },
  description: {
    type: String
  },
  logo: {
    type: String
  },
  specialties: [{
    type: String
  }],
  active: {
    type: Boolean,
    default: true
  },
  operationalCapacity: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  alerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create indexes
agencySchema.index({ name: 1 });
agencySchema.index({ type: 1 });
agencySchema.index({ contactEmail: 1 }, { unique: true, sparse: false });
agencySchema.index({ 'location': '2dsphere' });

// Pre-save middleware to ensure location type is 'Point' and email is unique
agencySchema.pre('save', async function(next) {
  try {
    if (this.location) {
      this.location.type = 'Point';
    }

    // Check if another agency has this email
    if (this.isModified('contactEmail')) {
      const existingAgency = await this.constructor.findOne({
        contactEmail: this.contactEmail,
        _id: { $ne: this._id }
      });
      
      if (existingAgency) {
        throw new Error('This email is already registered with another agency');
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

const Agency = mongoose.model('Agency', agencySchema);

// Create indexes if they don't exist
Agency.createIndexes().catch(err => {
  console.error('Error creating Agency indexes:', err);
});

export default Agency;