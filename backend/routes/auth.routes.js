import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  register,
  login,
  loginWithId,
  getCurrentUser,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/login-with-id', loginWithId);
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);

export default router;