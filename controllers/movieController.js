import Movie from "../models/movieModel.js";


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


const listMovies = async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json({ success: true, movies });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


const removeMovie = async (req, res) => {
  try {
    await Movie.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Movie Removed" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};



const singleMovie = async (req, res) => {
  try {
    
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




const updateMovie = async (req, res) => {
  try {
   
    const { movieId } = req.params;

   
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
      { new: true } 
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
