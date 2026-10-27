import express from 'express';
import { register, login, getMe, getStaffUsers } from '../controllers/authController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.get('/staff', authenticate, authorize('admin', 'staff'), getStaffUsers);

export default router;
