import express from 'express';
import { verifyToken, isAdmin, isManager } from '../middleware/auth.middleware.js';
import {
  getAllUsers,
  getAgencyUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus
} from '../controllers/user.controller.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', verifyToken, isAdmin, getAllUsers);

// Get users by agency
router.get('/agency/:agencyId', verifyToken, getAgencyUsers);

// Get user by ID
router.get('/:id', verifyToken, getUserById);

// Create new user
router.post('/', verifyToken, isManager, createUser);

// Update user
router.put('/:id', verifyToken, updateUser);

// Update user status (activate/deactivate)
router.put('/:id/status', verifyToken, isManager, updateUserStatus);

// Delete user
router.delete('/:id', verifyToken, isManager, deleteUser);

export default router;