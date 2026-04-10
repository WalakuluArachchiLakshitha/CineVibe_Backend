import User from '../models/userModel.js';
import OTP from '../models/otpModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import axios from 'axios';
import nodemailer from 'nodemailer';
import getDesignedEmail from '../lib/emailDesigner.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
    },
});

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exists" })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id);
            res.json({
                success: true,
                token,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    image: user.image
                }
            })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}


const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;


        const exists = await User.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }


        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }


        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })

        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}


const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token, user: { firstName: "Admin", lastName: "User", role: "admin" } })
        } else {

            const user = await User.findOne({ email });
            if (user && user.role === 'admin') {
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    const token = createToken(user._id);
                    res.json({
                        success: true,
                        token,
                        user: {
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            role: user.role,
                            image: user.image
                        }
                    })
                } else {
                    res.json({ success: false, message: "Invalid credentials" })
                }
            } else {
                res.json({ success: false, message: "Invalid credentials" })
            }
        }
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message })
    }
}

export { loginUser, registerUser, adminLogin }


export async function googleLogin(req, res) {

    const token = req.body.token;

    if (token == null) {
        res.status(400).json({
            message: "Token is required",
        });
        return;
    }
    try {
        const googleResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const googleUser = googleResponse.data;

        const user = await User.findOne({
            email: googleUser.email
        })

        if (user == null) {
            const newUser = new User({
                email: googleUser.email,
                firstName: googleUser.given_name || "Firstname",
                lastName: googleUser.family_name || "Lastname",
                password: "abc",
                isEmailVerified: googleUser.email_verified,
                image: googleUser.picture
            })

            let savedUser = await newUser.save()

            const jwtToken = createToken(savedUser._id);

            res.json({
                success: true,
                message: "Login successful",
                token: jwtToken,
                user: {
                    _id: savedUser._id,
                    email: savedUser.email,
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    role: savedUser.role,
                    isEmailVerified: savedUser.isEmailVerified,
                    image: savedUser.image,
                },
            });
            return;
        } else {


            if (!user.firstName || !user.lastName) {
                user.firstName = googleUser.given_name || "Firstname";
                user.lastName = googleUser.family_name || "Lastname";
                await user.save();
            }


            const isPlaceholderImage = !user.image || user.image.startsWith('/') || user.image === 'user.png';
            if (isPlaceholderImage && googleUser.picture) {
                user.image = googleUser.picture;
                await user.save();
            }


            const jwtToken = createToken(user._id);

            const responsePayload = {
                success: true,
                message: "Login successful",
                token: jwtToken,
                user: {
                    _id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    image: user.image,
                },
            };

            res.json(responsePayload);
            return;
        }

    } catch (err) {
        console.error("Error in googleLogin:", err);
        res.status(500).json({
            message: "Failed to login with google",
        });
        return;
    }
}

export async function sendOTP(req, res) {
    const email = req.params.email;
    if (email == null) {
        res.status(400).json({
            message: "Email is required",
        });
        return;
    }

    // 100000 - 999999
    const otp = Math.floor(100000 + Math.random() * 900000);

    try {
        const user = await User.findOne({ email: email });

        const firstName = user ? user.firstName : "there";

        if (user == null) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }

        await OTP.deleteMany({
            email: email,
        });

        const newOTP = new OTP({
            email: email,
            otp: otp,
        });
        await newOTP.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for Password Reset",
            text: `Hi! Your one-time passcode is ${otp}. It’s valid for 10 minutes. If you didn’t request this, ignore this email. — ${"CineVibe Cinema"}`,
            html: getDesignedEmail({
                otp,
                firstName,
                brandName: "CineVibe Cinema",
                supportEmail: "support@cinevibe.com",
                colors: { accent: "#fa812f", primary: "#fef3e2", secondary: "#393e46" },
            }),
        });

        res.json({
            message: "OTP sent to your email",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Failed to send OTP",
        });
    }
}


export async function changePasswordViaOTP(req, res) {
    const email = req.body.email;
    const otp = req.body.otp;
    const newPassword = req.body.newPassword;
    try {
        const otpRecord = await OTP.findOne({
            email: email,
            otp: otp.toString(),
        });

        if (!otpRecord) {
            res.status(400).json({ message: "Invalid OTP" });
            return;
        }
        if (otpRecord.expiresAt < Date.now()) {
            res.status(400).json({ message: "OTP expired" });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        await OTP.deleteMany({ email: email });

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await User.updateOne({ email: email }, { password: hashedPassword });
        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to change password" });
    }
}



export async function updateUserData(req, res) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: req.user.email },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        image: req.body.image,
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      message: "User data updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update user data",
    });
  }
}

export async function updatePassword(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "Unauthorized",
    });
    return;
  }
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    await User.updateOne(
      {
        email: req.user.email,
      },
      {
        password: hashedPassword,
      },
    );
    res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update password",
    });
  }
}

export async function getUserData(req, res) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
}

export async function getAllUsers(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

export async function blockUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const { email } = req.params;
    const { isBlock } = req.body;
    
    const user = await User.findOneAndUpdate(
      { email },
      { isBlock },
      { new: true }
    ).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User block status updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user block status" });
  }
}

export async function deleteUser(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    
    const { email } = req.params;
    
    const user = await User.findOneAndDelete({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
}


