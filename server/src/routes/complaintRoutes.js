import express from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  submitFeedback,
} from '../controllers/complaintController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(upload.array('images', 5), createComplaint)
  .get(getComplaints);

router.route('/:id')
  .get(getComplaintById);

router.patch('/:id/status', upload.single('proofImage'), updateStatus);
router.patch('/:id/assign', authorize('admin'), assignComplaint);
router.post('/:id/feedback', submitFeedback);

export default router;
