import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate({
        path: 'agency',
        select: '_id name type'
      });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure agency ID is available
    if (!user.agency || !user.agency._id) {
      console.error('User has no agency:', {
        userId: user._id,
        email: user.email,
        role: user.role
      });
      return res.status(400).json({ message: 'User is not associated with any agency' });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Check admin role middleware
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

// Check manager role middleware
export const isManager = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Manager role required' });
  }
};

// Check if user belongs to agency middleware
export const belongsToAgency = (agencyIdField) => {
  return async (req, res, next) => {
    try {
      const agencyId = req.params[agencyIdField] || req.body[agencyIdField];
      
      if (!agencyId) {
        return res.status(400).json({ message: 'Agency ID not provided' });
      }
      
      if (req.user.agency.toString() !== agencyId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Not authorized for this agency' });
      }
      
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};