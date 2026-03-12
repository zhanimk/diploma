const User = require('../models/userModel');
const Club = require('../models/clubModel');
const Tournament = require('../models/tournamentModel');
const Application = require('../models/applicationModel'); // Импортируем модель заявок
const asyncHandler = require('express-async-handler');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalClubs = await Club.countDocuments({});
        const totalTournaments = await Tournament.countDocuments({});
        
        // Считаем заявки, ожидающие рассмотрения
        const pendingApplications = await Application.countDocuments({ status: 'SUBMITTED' });

        // Статистика по ролям
        const usersByRoleData = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const usersByRole = usersByRoleData.reduce((acc, role) => {
            if (role._id) {
                acc[role._id] = role.count;
            }
            return acc;
        }, {});

        usersByRole.athlete = usersByRole.athlete || 0;
        usersByRole.coach = usersByRole.coach || 0;
        usersByRole.referee = usersByRole.referee || 0;

        res.json({
            totalUsers,
            totalClubs,
            totalTournaments,
            usersByRole,
            pendingApplications, // Добавляем новое поле в ответ
        });
    } catch (error) {
        res.status(500);
        throw new Error('Server error while fetching dashboard stats');
    }
});

module.exports = {
    getDashboardStats,
};
