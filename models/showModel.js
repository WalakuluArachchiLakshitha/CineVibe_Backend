import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'movie', required: true },
    showDateTime: { type: Date, required: true },
    showPrice: { type: Number, required: true },
    occupiedSeats: { type: Object, default: {} } // seatId: userId
})

const Show = mongoose.models.show || mongoose.model('show', showSchema);

export default Show;
