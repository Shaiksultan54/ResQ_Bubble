import { verifyToken } from '../middleware/auth.middleware.js';

import express from 'express';
import {
  createAlert,
  getAgencyAlerts,
  getSentAlerts,
  markAlertAsRead,
  deactivateAlert,
  getUnreadAlertCount
} from '../controllers/alert.controller.js';

const router = express.Router();

// Create a new alert
router.post('/', verifyToken, createAlert);

// Get alerts for an agency
router.get('/agency/:agencyId', verifyToken, getAgencyAlerts);

// Get alerts sent by an agency
router.get('/sent/:agencyId', verifyToken, getSentAlerts);

// Mark an alert as read
router.put('/:alertId/read', verifyToken, markAlertAsRead);

// Deactivate an alert
router.put('/:alertId/deactivate', verifyToken, deactivateAlert);

// Get unread alert count for an agency
router.get('/unread/count/:agencyId', verifyToken, getUnreadAlertCount);

export default router;