import express from "express";
import {
  addMovie,
  listMovies,
  removeMovie,
  singleMovie,
  updateMovie,
} from "../controllers/movieController.js";
import adminAuth from "../middleware/adminAuth.js";

const movieRouter = express.Router();

movieRouter.post("/add", adminAuth, addMovie);

movieRouter.delete("/remove", adminAuth, removeMovie);
movieRouter.put("/update/:movieId", adminAuth, updateMovie);

movieRouter.get("/single/:movieId", singleMovie);
movieRouter.get("/list", listMovies);

export default movieRouter;
