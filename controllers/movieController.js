import Movie from "../models/movieModel.js";

// Add Movie
const addMovie = async (req, res) => {
  try {
    const {
      title,
      overview,
      release_date,
      runtime,
      poster_path,
      trailer_url,
      genres,
      languages,
      country,
      vote_average,
    } = req.body;

    const movieData = {
      title,
      overview,
      release_date,
      runtime,
      poster_path,
      trailer_url,
      genres,
      languages,
      country,
      vote_average: Number(vote_average),
      vote_count: 0,
    };

    const movie = new Movie(movieData);
    await movie.save();

    res.json({ success: true, message: "Movie Added" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// List Movies
const listMovies = async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// Remove Movie
const removeMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Movie Removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// Single Movie Info
const singleMovie = async (req, res) => {
  try {
    // Changed from req.body to req.params
    const { movieId } = req.params;

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.json({ success: false, message: "Movie not found" });
    }

    res.json({ success: true, movie });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



// Update Movie Info
const updateMovie = async (req, res) => {
  try {
    // 1. Get the ID from the URL params
    const { movieId } = req.params;

    // 2. Get the updated data from the body
    const {
      title,
      overview,
      release_date,
      runtime,
      poster_path,
      trailer_url,
      genres,
      languages,
      country,
      vote_average,
    } = req.body;

    // 3. Perform the update
    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      {
        title,
        overview,
        release_date,
        runtime,
        poster_path,
        trailer_url,
        genres,
        languages,
        country,
        vote_average: Number(vote_average),
      },
      { new: true } // This option returns the modified document rather than the original
    );

    if (!updatedMovie) {
      return res.json({ success: false, message: "Movie not found" });
    }

    res.json({ success: true, message: "Movie Updated", updatedMovie });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { addMovie, listMovies, removeMovie, singleMovie, updateMovie };
