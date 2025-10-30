import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const verifySocketToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    const user = await User.findById(decoded.id)
      .select('-password')
      .populate('agency', 'name type');
    
    if (!user) {
      return next(new Error('Authentication error: User not found'));
    }
    
    socket.user = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      agency: user.agency._id,
      agencyName: user.agency.name
    };
    
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
  }
};