import { Router } from 'express';
import { adminLogin } from '../middleware/adminAuth.js';

export const adminRoutes = Router();

adminRoutes.post('/login', adminLogin);
