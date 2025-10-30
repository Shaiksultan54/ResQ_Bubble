import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: function(v) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
      },
      message: 'Password must be at least 8 characters long and contain at least one number, one uppercase letter, and one lowercase letter'
    }
  },
  agency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user'],
    default: 'user'
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  loginId: {
    type: String,
    unique: true,
    sparse: true
  },
  permissions: [{
    type: String,
    enum: [
      'manage_users',
      'manage_inventory',
      'manage_borrows',
      'send_alerts',
      'view_reports',
      'manage_agency'
    ]
  }],
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  }
}, { timestamps: true });

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ loginId: 1 }, { unique: true, sparse: true });
userSchema.index({ agency: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  try {
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to generate loginId and set permissions based on role
userSchema.pre('save', async function(next) {
  try {
    // Set default permissions based on role
    if (this.isModified('role')) {
      switch (this.role) {
        case 'admin':
          this.permissions = [
            'manage_users',
            'manage_inventory',
            'manage_borrows',
            'send_alerts',
            'view_reports',
            'manage_agency'
          ];
          break;
        case 'manager':
          this.permissions = [
            'manage_inventory',
            'manage_borrows',
            'send_alerts',
            'view_reports'
          ];
          break;
        case 'user':
          this.permissions = ['view_reports'];
          break;
      }
    }

    // Generate loginId if not exists
    if (!this.loginId) {
      const agency = await mongoose.model('Agency').findById(this.agency);
      if (!agency) {
        throw new Error('Agency not found');
      }
      
      // Get the last user for this agency
      const lastUser = await this.constructor
        .findOne({ agency: this.agency })
        .sort({ loginId: -1 });
      
      let userCount = 0;
      if (lastUser && lastUser.loginId) {
        const lastNumber = parseInt(lastUser.loginId.slice(3));
        userCount = isNaN(lastNumber) ? 0 : lastNumber;
      }
      
      const agencyCode = agency.name.substring(0, 3).toUpperCase();
      this.loginId = `${agencyCode}${String(userCount + 1).padStart(3, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!candidatePassword) {
      throw new Error('Password is required');
    }
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Error comparing passwords');
  }
};

// Method to check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission);
};

// Method to check if user can manage other users
userSchema.methods.canManageUsers = function() {
  return this.role === 'admin' || this.permissions.includes('manage_users');
};

// Method to check if user can manage inventory
userSchema.methods.canManageInventory = function() {
  return this.role === 'admin' || this.permissions.includes('manage_inventory');
};

// Method to check if user can manage borrows
userSchema.methods.canManageBorrows = function() {
  return this.role === 'admin' || this.permissions.includes('manage_borrows');
};

// Method to check if user can send alerts
userSchema.methods.canSendAlerts = function() {
  return this.role === 'admin' || this.permissions.includes('send_alerts');
};

// Method to check if user can view reports
userSchema.methods.canViewReports = function() {
  return this.role === 'admin' || this.permissions.includes('view_reports');
};

// Method to check if user can manage agency
userSchema.methods.canManageAgency = function() {
  return this.role === 'admin' || this.permissions.includes('manage_agency');
};

const User = mongoose.model('User', userSchema);

// Create indexes if they don't exist
User.createIndexes().catch(err => {
  console.error('Error creating User indexes:', err);
});

export default User;