import Show from "../models/showModel.js";

const addShow = async (req, res) => {
  try {
    const { movieId, showDateTime, showPrice } = req.body;

    const show = new Show({
      movie: movieId,
      showDateTime,
      showPrice,
      occupiedSeats: {},
    });

    await show.save();
    res.json({ success: true, message: "Show Added" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const listShows = async (req, res) => {
  try {
    const { movieId } = req.query;
    let shows;
    if (movieId) {
      shows = await Show.find({ movie: movieId }).populate("movie");
    } else {
      shows = await Show.find({}).populate("movie");
    }
    res.json({ success: true, shows });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const getShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await Show.findById(showId).populate("movie");

    if (!show) {
      return res
        .status(404)
        .json({ success: false, message: "Show not found" });
    }

    res.json({ success: true, show });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeShow = async (req, res) => {
  try {
    const { showId } = req.params;
    await Show.findByIdAndDelete(showId);
    res.json({ success: true, message: "Show Deleted Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { addShow, listShows, getShow, removeShow };
