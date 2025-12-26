import express from 'express';
import { addShow, listShows, getShow, removeShow } from '../controllers/showController.js';
import adminAuth from '../middleware/adminAuth.js';

const showRouter = express.Router();

showRouter.post('/add', adminAuth, addShow);
showRouter.get('/list', listShows);
showRouter.get('/single/:showId', getShow);
showRouter.delete('/delete/:showId', adminAuth, removeShow);

export default showRouter;
