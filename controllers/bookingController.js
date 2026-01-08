import Booking from "../models/bookingModel.js";
import Show from "../models/showModel.js";
import mongoose from "mongoose";


const createBooking = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { userId, showId, seats, amount } = req.body;

     
        const show = await Show.findById(showId).session(session);
        if (!show) {
            throw new Error("Show not found");
        }

        for (const seat of seats) {
            if (show.occupiedSeats && show.occupiedSeats[seat]) {
                throw new Error(`Seat ${seat} is already booked`);
            }
        }

       
        const booking = new Booking({
            user: userId,
            show: showId,
            bookedSeats: seats.reduce((acc, seat) => ({ ...acc, [seat]: seat }), {}), 
            amount,
            date: Date.now(),
            payment: true
        });

        await booking.save({ session });

       
        if (!show.occupiedSeats) show.occupiedSeats = {};
        seats.forEach(seat => {
            show.occupiedSeats[seat] = userId;
        });

        
        show.markModified('occupiedSeats');
        await show.save({ session });

        await session.commitTransaction();
        res.json({ success: true, message: "Booking Confirmed", booking });

    } catch (error) {
        await session.abortTransaction();
        console.error(error);
        res.json({ success: false, message: error.message })
    } finally {
        session.endSession();
    }
}


const userBookings = async (req, res) => {
    try {
        const { userId } = req.body; 
        const bookings = await Booking.find({ user: userId }).populate({
            path: 'show',
            populate: { path: 'movie' }
        });
        res.json({ success: true, bookings })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}


const listBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: 'show',
            populate: { path: 'movie' }
        });
        res.json({ success: true, bookings })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}


const deleteBookings = async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Booking deleted" });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { createBooking, userBookings, listBookings, deleteBookings }