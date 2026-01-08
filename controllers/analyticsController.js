import Booking from "../models/bookingModel.js";
import Show from "../models/showModel.js";
import User from "../models/userModel.js";


const getDashboardStats = async (req, res) => {
    try {
       
        const totalBookings = await Booking.countDocuments();

       
        const revenueData = await Booking.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$amount" }
                }
            }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

      
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        
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
