const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');
const Club = require('../models/clubModel.js');
const Tournament = require('../models/tournamentModel.js');
const Application = require('../models/applicationModel.js');
const AuditLog = require('../models/auditLogModel.js'); // Импортируем новую модель

const getDashboardData = asyncHandler(async (req, res) => {

    // 1. Fetch statistics (исправлено)
    const totalUsers = await User.countDocuments({});
    const totalClubs = await Club.countDocuments({});
    const totalTournaments = await Tournament.countDocuments({});
    const pendingClubsCount = await Club.countDocuments({ isVerified: false }); // Используем isVerified

    // 2. Fetch pending clubs (исправлено, лимит 5)
    const pendingClubs = await Club.find({ isVerified: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name region createdAt');

    // 3. Fetch tournaments with recent PENDING applications
    const tournamentsWithNewApps = await Application.aggregate([
        { $match: { status: 'PENDING' } },
        { $group: { _id: '$tournament', newApplicationsCount: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'tournaments',
                localField: '_id',
                foreignField: '_id',
                as: 'tournamentDetails'
            }
        },
        { $unwind: '$tournamentDetails' },
        {
            $project: {
                _id: '$tournamentDetails._id',
                name: '$tournamentDetails.name',
                newApplicationsCount: 1
            }
        }
    ]);

    // 4. Fetch REAL audit logs (лимит 10)
    const auditLogs = await AuditLog.find({})
        .populate('user', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10);

    res.json({
        stats: {
            totalUsers,
            totalClubs,
            totalTournaments,
            pendingClubsCount
        },
        pendingClubs,
        recentTournamentsWithApps: tournamentsWithNewApps,
        auditLogs // Теперь это реальные данные
    });
});

module.exports = { getDashboardData };
