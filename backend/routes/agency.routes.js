import express from 'express';
import { verifyToken, isAdmin, isManager } from '../middleware/auth.middleware.js';
import {
  getAllAgencies,
  getAgencyById,
  createAgency,
  updateAgency,
  getNearbyAgencies,
  getAgenciesByType
} from '../controllers/agency.controller.js';

const router = express.Router();

router.get('/', verifyToken, getAllAgencies);
router.get('/:id', verifyToken, getAgencyById);
router.post('/', verifyToken, isAdmin, createAgency);
router.put('/:id', verifyToken, isManager, updateAgency);
router.get('/nearby/:distance', verifyToken, getNearbyAgencies);
router.get('/type/:type', verifyToken, getAgenciesByType);

export default router;