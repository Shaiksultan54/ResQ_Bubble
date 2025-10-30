import express from 'express';
import { verifyToken, isManager } from '../middleware/auth.middleware.js';
import {
  getAgencyInventory,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  searchInventory,
  getAvailableItemsByCategory,
  getOtherAgenciesInventory
} from '../controllers/inventory.controller.js';

const router = express.Router();

// Specific routes first
router.get('/other-agencies', verifyToken, getOtherAgenciesInventory);
router.get('/search', verifyToken, searchInventory);
router.get('/available/:category', verifyToken, getAvailableItemsByCategory);
router.get('/agency/:agencyId', verifyToken, getAgencyInventory);

// Parameterized routes last
router.get('/:id', verifyToken, getInventoryItemById);
router.post('/', verifyToken, isManager, createInventoryItem);
router.put('/:id', verifyToken, isManager, updateInventoryItem);
router.delete('/:id', verifyToken, isManager, deleteInventoryItem);

export default router;