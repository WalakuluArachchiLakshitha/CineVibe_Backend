import express from 'express';
import { loginUser, registerUser, adminLogin } from '../controllers/authController.js';
import { googleLogin } from '../controllers/authController.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/admin', adminLogin);
authRouter.post('/google-login', googleLogin);



export default authRouter; 
