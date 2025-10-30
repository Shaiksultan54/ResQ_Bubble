import express from 'express';
import { verifyToken, isManager } from '../middleware/auth.middleware.js';
import {
  createTransfer,
  updateTransferLocation,
  getActiveTransfers,
  getTransferById,
  updateTransferStatus,
  addTransferPhoto,
  getTransferHistory,
  emergencyAlert
} from '../controllers/transfer.controller.js';

const router = express.Router();

// Create new transfer
router.post('/', verifyToken, isManager, createTransfer);

// Update transfer location (GPS tracking)
router.put('/:transferId/location', verifyToken, updateTransferLocation);

// Get active transfers for agency
router.get('/active/:agencyId', verifyToken, getActiveTransfers);

// Get transfer by ID
router.get('/:transferId', verifyToken, getTransferById);

// Update transfer status
router.put('/:transferId/status', verifyToken, updateTransferStatus);

// Add photo to transfer
router.post('/:transferId/photos', verifyToken, addTransferPhoto);

// Get transfer history
router.get('/history/:agencyId', verifyToken, getTransferHistory);

// Emergency alert
router.post('/:transferId/emergency', verifyToken, emergencyAlert);

export default router;