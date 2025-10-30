import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import {
  getAgencyMessages,
  getConversation,
  sendMessage,
  markMessageAsRead,
  getUnreadMessageCount
} from '../controllers/message.controller.js';

const router = express.Router();

router.get('/agency/:agencyId', verifyToken, getAgencyMessages);
router.get('/conversation/:agency1Id/:agency2Id', verifyToken, getConversation);
router.post('/', verifyToken, sendMessage);
router.put('/:id/read', verifyToken, markMessageAsRead);
router.get('/unread/count/:agencyId', verifyToken, getUnreadMessageCount);

export default router;