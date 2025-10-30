import User from '../models/user.model.js';
import Agency from '../models/agency.model.js';

export const getAgencyUsers = async (req, res) => {
  try {
    const { agencyId } = req.params;
    
    // Check if user belongs to the agency or is admin
    if (req.user.agency.toString() !== agencyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view users for this agency' });
    }
    
    const users = await User.find({ agency: agencyId })
      .select('-password')
      .populate('agency', 'name type')
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('agency', 'name type');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user belongs to the same agency or is admin
    if (req.user.agency.toString() !== user.agency._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, agencyId } = req.body;
    
    // Only admin or manager can create users
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to create users' });
    }
    
    // If not admin, can only create users for their own agency
    const targetAgencyId = agencyId || req.user.agency;
    if (req.user.role !== 'admin' && req.user.agency.toString() !== targetAgencyId) {
      return res.status(403).json({ message: 'Not authorized to create users for this agency' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Validate role
    const validRoles = ['admin', 'manager', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Only admin can create admin users
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can create admin users' });
    }
    
    // Verify agency exists
    const agency = await Agency.findById(targetAgencyId);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }
    
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      agency: targetAgencyId
    });
    
    await newUser.save();
    
    const userResponse = await User.findById(newUser._id)
      .select('-password')
      .populate('agency', 'name type');
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, role } = req.body;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check permissions
    const isSelfUpdate = req.user._id.toString() === userId;
    const isSameAgency = req.user.agency.toString() === user.agency.toString();
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    
    if (!isSelfUpdate && !isAdmin && !(isManager && isSameAgency)) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    // Role update restrictions
    if (role && role !== user.role) {
      // Only admin can change roles
      if (!isAdmin) {
        return res.status(403).json({ message: 'Only admin can change user roles' });
      }
      
      // Cannot change admin role unless you're admin
      if (user.role === 'admin' && !isAdmin) {
        return res.status(403).json({ message: 'Cannot modify admin user' });
      }
      
      // Validate new role
      const validRoles = ['admin', 'manager', 'user'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
    }
    
    const updateData = { firstName, lastName };
    if (role && isAdmin) {
      updateData.role = role;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password').populate('agency', 'name type');
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check permissions
    const isSameAgency = req.user.agency.toString() === user.agency.toString();
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    
    if (!isAdmin && !(isManager && isSameAgency)) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }
    
    // Cannot delete admin users unless you're admin
    if (user.role === 'admin' && !isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }
    
    // Cannot delete yourself
    if (req.user._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { active } = req.body;
    const userId = req.params.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Only admin or manager of same agency can update status
    const isSameAgency = req.user.agency.toString() === user.agency.toString();
    const isAdmin = req.user.role === 'admin';
    const isManager = req.user.role === 'manager';
    
    if (!isAdmin && !(isManager && isSameAgency)) {
      return res.status(403).json({ message: 'Not authorized to update user status' });
    }
    
    // Cannot deactivate admin users unless you're admin
    if (user.role === 'admin' && !isAdmin) {
      return res.status(403).json({ message: 'Cannot modify admin user status' });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { active },
      { new: true }
    ).select('-password').populate('agency', 'name type');
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Only admin can view all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { agency, role, active } = req.query;
    const filter = {};
    
    if (agency) filter.agency = agency;
    if (role) filter.role = role;
    if (active !== undefined) filter.active = active === 'true';
    
    const users = await User.find(filter)
      .select('-password')
      .populate('agency', 'name type')
      .sort({ createdAt: -1 });
    
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};