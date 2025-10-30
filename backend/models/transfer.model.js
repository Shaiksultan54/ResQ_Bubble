import mongoose from 'mongoose';

const transferSchema = new mongoose.Schema({
  transferId: {
    type: String,
    unique: true,
    required: true
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  fromAgency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  toAgency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dispatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'dispatched', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  estimatedDeliveryTime: {
    type: Date,
    required: true
  },
  actualDeliveryTime: {
    type: Date
  },
  route: {
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    },
    endLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      timestamp: {
        type: Date
      }
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
      },
      timestamp: {
        type: Date
      },
      speed: {
        type: Number // km/h
      },
      heading: {
        type: Number // degrees
      }
    },
    waypoints: [{
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      event: {
        type: String,
        enum: ['checkpoint', 'stop', 'delay', 'emergency'],
        default: 'checkpoint'
      },
      notes: String
    }]
  },
  notifications: [{
    type: {
      type: String,
      enum: ['dispatch', 'location_update', 'delay', 'delivery', 'emergency'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    recipients: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      read: {
        type: Boolean,
        default: false
      },
      readAt: Date
    }]
  }],
  specialInstructions: {
    type: String
  },
  securityCode: {
    type: String,
    required: true
  },
  photos: [{
    url: String,
    type: {
      type: String,
      enum: ['pickup', 'transit', 'delivery', 'incident']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    }
  }],
  deliveryConfirmation: {
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    signature: String,
    photo: String,
    timestamp: Date,
    notes: String
  }
}, { timestamps: true });

// Index for geospatial queries
transferSchema.index({ 'route.currentLocation': '2dsphere' });
transferSchema.index({ 'route.startLocation': '2dsphere' });
transferSchema.index({ 'route.endLocation': '2dsphere' });

// Generate unique transfer ID
transferSchema.pre('save', async function(next) {
  if (!this.transferId) {
    const count = await this.constructor.countDocuments();
    this.transferId = `TRF${String(count + 1).padStart(6, '0')}`;
  }
  
  // Generate security code
  if (!this.securityCode) {
    this.securityCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  
  next();
});

const Transfer = mongoose.model('Transfer', transferSchema);

export default Transfer;