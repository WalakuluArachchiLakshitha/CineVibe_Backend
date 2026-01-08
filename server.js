import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import movieRouter from './routes/movieRoutes.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import analyticsRouter from './routes/analyticsRoutes.js';


const app = express();
const port = process.env.PORT || 4000;
connectDB();


app.use(express.json());
app.use(cors());


app.use('/api/auth', authRouter);
app.use('/api/movie', movieRouter);
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/', (req, res) => {
    res.send("API Working well");
});


app.listen(port, () => console.log(`Server started on PORT : ${port}`));
