import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    overview: { type: String, required: true },
    release_date: { type: Date, required: true },
    runtime: { type: Number, required: true },
    poster_path: { type: String, required: true }, 
    trailer_url: { type: String, required: true }, 
    genres: { type: Array, required: true },
    languages: { type: Array, required: true },
    country: { type: String, required: true },
    vote_average: { type: Number, default: 0 },
    vote_count: { type: Number, default: 0 }
})

const Movie = mongoose.models.movie || mongoose.model('movie', movieSchema);

export default Movie;
