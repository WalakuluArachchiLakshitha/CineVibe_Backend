import express from 'express';
import { createBooking, userBookings, listBookings, deleteBookings } from '../controllers/bookingController.js';
import adminAuth from '../middleware/adminAuth.js';
// Add userAuth middleware if needed, for now using direct endpoint

const bookingRouter = express.Router();

bookingRouter.post('/create', createBooking);
bookingRouter.post('/my-bookings', userBookings); // Should be protected by auth middleware to get userId from token
bookingRouter.get('/list', adminAuth, listBookings);
bookingRouter.delete('/delete', adminAuth, deleteBookings);

export default bookingRouter;
