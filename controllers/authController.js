import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import validator from 'validator';
import axios from 'axios';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
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
                    role: user.role
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

// Route for user register
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        // Checking user already exists or not
        const exists = await User.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }

        // Validating email format & strong password
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // Hashing user password
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

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Basic hardcoded admin check for demo, ideally use DB role
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token, user: { firstName: "Admin", lastName: "User", role: "admin" } })
        } else {
            // Fallback to checking DB for role='admin'
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
                            role: user.role
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
                firstName: googleUser.given_name || "Firstname", // Fallback to prevent validation error
                lastName: googleUser.family_name || "Lastname",   // Fallback to prevent validation error
                password: "abc", // dummy password for OAuth users
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

            // Migration logic: If existing user is missing names (from old schema), update them
            if (!user.firstName || !user.lastName) {
                user.firstName = googleUser.given_name || "Firstname";
                user.lastName = googleUser.family_name || "Lastname";
                await user.save();
            }

            // Update image if it's missing or is a placeholder (like /user.png)
            const isPlaceholderImage = !user.image || user.image.startsWith('/') || user.image === 'user.png';
            if (isPlaceholderImage && googleUser.picture) {
                user.image = googleUser.picture;
                await user.save();
            }

            //login the user
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

