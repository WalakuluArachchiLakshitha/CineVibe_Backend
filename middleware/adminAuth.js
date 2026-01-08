import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        success: false,
        message: "Not Authorized Login Again",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res.json({ success: false, message: "Admin access only" });
    }

    req.user = user; 
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Invalid Token" });
  }
};

export default adminAuth;
