import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    show: { type: mongoose.Schema.Types.ObjectId, ref: 'show', required: true },
    bookedSeats: { type: Object, required: true }, // Array of seat IDs or Map
    amount: { type: Number, required: true },
    date: { type: Number, required: true }, // Timestamp
    payment: { type: Boolean, default: false }
})

const Booking = mongoose.models.booking || mongoose.model('booking', bookingSchema);

export default Booking;
