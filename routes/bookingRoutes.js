import express from 'express';
import { createBooking, userBookings, listBookings, deleteBookings } from '../controllers/bookingController.js';
import adminAuth from '../middleware/adminAuth.js';


const bookingRouter = express.Router();

bookingRouter.post('/create', createBooking);
bookingRouter.post('/my-bookings', userBookings);
bookingRouter.get('/list', adminAuth, listBookings);
bookingRouter.delete('/delete', adminAuth, deleteBookings);

export default bookingRouter;
