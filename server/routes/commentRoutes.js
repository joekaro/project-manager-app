import express from 'express';
import {
  getProjectComments,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createComment);

router.route('/project/:projectId')
  .get(protect, getProjectComments);

router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

export default router;