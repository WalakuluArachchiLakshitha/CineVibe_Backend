import express from 'express';
import { loginUser, registerUser, adminLogin, sendOTP, googleLogin, changePasswordViaOTP, updatePassword, updateUserData, getUserData, getAllUsers, blockUser, deleteUser } from '../controllers/authController.js';
import userAuth from '../middleware/userAuth.js';


const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/admin', adminLogin);
authRouter.post('/google-login', googleLogin);
authRouter.get("/send-otp/:email", sendOTP)
authRouter.post("/change-password", changePasswordViaOTP)
authRouter.get("/me", userAuth, getUserData)
authRouter.put("/me/password", userAuth, updatePassword)

// Admin user management routes
authRouter.get("/all-users", userAuth, getAllUsers)
authRouter.put("/block/:email", userAuth, blockUser)
authRouter.delete("/:email", userAuth, deleteUser)


export default authRouter; 
