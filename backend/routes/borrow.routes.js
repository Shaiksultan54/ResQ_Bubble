import express from 'express';
import { verifyToken, isManager } from '../middleware/auth.middleware.js';
import {
  getAllBorrowRequests,
  getBorrowById,
  createBorrowRequest,
  updateBorrowStatus,
  getAgencyBorrowHistory,
  getItemBorrowHistory
} from '../controllers/borrow.controller.js';

const router = express.Router();

router.get('/', verifyToken, getAllBorrowRequests);
router.get('/:id', verifyToken, getBorrowById);
router.post('/', verifyToken, createBorrowRequest);
router.put('/:id/status', verifyToken, isManager, updateBorrowStatus);
router.get('/history/agency/:agencyId', verifyToken, getAgencyBorrowHistory);
router.get('/history/item/:itemId', verifyToken, getItemBorrowHistory);

export default router;