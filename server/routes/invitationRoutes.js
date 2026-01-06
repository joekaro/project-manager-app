import express from 'express';
import {
  sendInvitation,
  getMyInvitations,
  getProjectInvitations,
  acceptInvitation,
  declineInvitation,
  deleteInvitation
} from '../controllers/invitationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, sendInvitation)
  .get(protect, getMyInvitations);

router.route('/project/:projectId')
  .get(protect, getProjectInvitations);

router.route('/:id/accept')
  .put(protect, acceptInvitation);

router.route('/:id/decline')
  .put(protect, declineInvitation);

router.route('/:id')
  .delete(protect, deleteInvitation);

export default router;