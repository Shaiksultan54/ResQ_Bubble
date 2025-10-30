import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Agency from '../models/agency.model.js';
import mongoose from 'mongoose';

export const register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Log the complete request body
    console.log('Registration request body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    const requiredFields = ['email', 'password', 'firstName', 'lastName'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        message: 'Validation error',
        errors: [`Missing required fields: ${missingFields.join(', ')}`]
      });
    }

    // Validate agency data
    if (!req.body.agency) {
      console.log('Missing agency data in request');
      return res.status(400).json({
        message: 'Validation error',
        errors: ['Agency information is required']
      });
    }

    const requiredAgencyFields = ['name', 'type', 'contactPhone'];
    const missingAgencyFields = requiredAgencyFields.filter(field => !req.body.agency[field]);
    
    if (missingAgencyFields.length > 0) {
      console.log('Missing required agency fields:', missingAgencyFields);
      return res.status(400).json({
        message: 'Validation error',
        errors: [`Missing required agency fields: ${missingAgencyFields.join(', ')}`]
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.body.email)) {
      return res.status(400).json({
        message: 'Validation error',
        errors: ['Please enter a valid email address']
      });
    }

    // Validate password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(req.body.password)) {
      return res.status(400).json({
        message: 'Validation error',
        errors: ['Password must be at least 8 characters long and contain at least one number, one uppercase letter, and one lowercase letter']
      });
    }

    // Validate phone format
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(req.body.agency.contactPhone)) {
      return res.status(400).json({
        message: 'Validation error',
        errors: ['Please enter a valid phone number (minimum 10 digits)']
      });
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', req.body.email);
    const existingUser = await User.findOne({ 
      email: { $regex: new RegExp(`^${req.body.email}$`, 'i') }
    });
    if (existingUser) {
      console.log('User already exists:', {
        email: existingUser.email,
        id: existingUser._id,
        createdAt: existingUser.createdAt
      });
      return res.status(400).json({
        message: 'Validation error',
        errors: ['Email already exists']
      });
    }

    // Check if agency with same email exists
    console.log('Checking for existing agency with email:', req.body.email);
    const existingAgency = await Agency.findOne({ 
      contactEmail: { $regex: new RegExp(`^${req.body.email}$`, 'i') }
    });
    if (existingAgency) {
      console.log('Agency with this email already exists:', {
        email: existingAgency.contactEmail,
        id: existingAgency._id,
        name: existingAgency.name
      });
      return res.status(400).json({
        message: 'Validation error',
        errors: ['This email is already registered with another agency']
      });
    }

    // Create agency
    const agencyData = {
      name: req.body.agency.name,
      type: req.body.agency.type,
      contactEmail: req.body.email,
      contactPhone: req.body.agency.contactPhone,
      address: req.body.agency.address || {},
      location: req.body.agency.location || {
        type: 'Point',
        coordinates: [0, 0]
      },
      active: true,
      operationalCapacity: 100
    };

    console.log('Creating agency with data:', JSON.stringify(agencyData, null, 2));
    const agency = await Agency.create([agencyData], { session });
    console.log('Agency created successfully:', agency[0]._id);

    // Create admin user with temporary loginId
    const userData = {
      email: req.body.email,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      agency: agency[0]._id,
      role: 'admin',
      active: true,
      loginId: `${agencyData.name.substring(0, 3).toUpperCase()}001`
    };

    console.log('Creating admin user with data:', { ...userData, password: '[REDACTED]' });
    const user = await User.create([userData], { session });
    console.log('Admin user created successfully:', user[0]._id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user[0]._id, 
        role: user[0].role,
        agencyId: agency[0]._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    await session.commitTransaction();
    console.log('Registration transaction committed successfully');

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user[0]._id,
        email: user[0].email,
        firstName: user[0].firstName,
        lastName: user[0].lastName,
        role: user[0].role,
        permissions: user[0].permissions,
        agency: {
          id: agency[0]._id,
          name: agency[0].name,
          type: agency[0].type
        }
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Registration error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue,
      body: JSON.stringify(req.body, null, 2)
    });

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const fieldName = field === 'email' ? 'Email' : 
                       field === 'loginId' ? 'Login ID' : 
                       field === 'agency.name' ? 'Agency name' : 
                       field === 'contactEmail' ? 'Agency email' : field;
      return res.status(400).json({
        message: 'Validation error',
        errors: [`${fieldName} already exists`]
      });
    }

    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Login failed',
        error: 'Email and password are required'
      });
    }

    // Find user and populate agency
    const user = await User.findOne({ email })
      .populate({
        path: 'agency',
        select: '_id name type active'
      });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({ message: 'Account is inactive' });
    }

    // Check if agency exists and is active
    if (!user.agency || !user.agency._id) {
      console.error('User has no agency:', {
        userId: user._id,
        email: user.email,
        role: user.role
      });
      return res.status(401).json({ message: 'User is not associated with any agency' });
    }

    if (!user.agency.active) {
      return res.status(401).json({ message: 'Agency is inactive' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        agencyId: user.agency._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log successful login
    console.log('User logged in successfully:', {
      userId: user._id,
      email: user.email,
      role: user.role,
      agencyId: user.agency._id,
      agencyName: user.agency.name
    });

    res.json({
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        agency: {
          _id: user.agency._id,
          name: user.agency.name,
          type: user.agency.type
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // The user is already attached to req by the verifyToken middleware
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate({
        path: 'agency',
        select: '_id name type'
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName },
      { new: true }
    ).select('-password').populate('agency', 'name type');
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginWithId = async (req, res) => {
  try {
    const { loginId, password } = req.body;

    const user = await User.findOne({ loginId, active: true }).populate('agency', 'name type active');
    if (!user) {
      return res.status(404).json({ message: 'Invalid login ID or user inactive' });
    }

    // Check if agency is active
    if (!user.agency.active) {
      return res.status(403).json({ message: 'Agency is inactive' });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Update last login time
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        agency: user.agency._id,
        agencyName: user.agency.name,
        loginId: user.loginId,
        permissions: user.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};