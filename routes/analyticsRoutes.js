import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import adminAuth from '../middleware/adminAuth.js';

const analyticsRouter = express.Router();

analyticsRouter.get('/dashboard', adminAuth, getDashboardStats);

export default analyticsRouter;
