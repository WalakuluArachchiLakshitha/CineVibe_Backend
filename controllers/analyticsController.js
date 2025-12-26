import Booking from "../models/bookingModel.js";
import Show from "../models/showModel.js";
import User from "../models/userModel.js";

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
    try {
        // Get total bookings count
        const totalBookings = await Booking.countDocuments();

        // Get total revenue (sum of all booking amounts)
        const revenueData = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        // Get total users (exclude admins)
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        // Get upcoming active shows (future shows with movie data)
        const now = new Date();
        const activeShows = await Show.find({ showDateTime: { $gte: now } })
            .populate('movie')
            .sort({ showDateTime: 1 })
            .limit(6);

        res.json({
            success: true,
            stats: {
                totalBookings,
                totalRevenue,
                totalUsers,
                activeShows: activeShows.length,
                upcomingShows: activeShows
            }
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

export { getDashboardStats };
