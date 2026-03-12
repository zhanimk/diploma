const Club = require('../models/clubModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

// ... (existing functions like createClub, getClubs, etc.)

// @desc    Get a single club by ID with its athletes
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = asyncHandler(async (req, res) => {
    const clubId = req.params.id;

    const club = await Club.findById(clubId).populate('coach', 'firstName lastName phone').lean();

    if (!club) {
        res.status(404);
        throw new Error('Club not found');
    }

    const athletes = await User.find({
        club: clubId,
        role: 'athlete',
        clubStatus: 'approved'
    }).select('firstName lastName dateOfBirth gender').lean();

    const coachInfo = club.coach ? {
        name: `${club.coach.firstName} ${club.coach.lastName}`,
        phone: club.coach.phone || '—'
    } : {
        name: 'Тренер белгісіз',
        phone: '—'
    };

    const response = {
        _id: club._id,
        name: club.name,
        coachName: coachInfo.name,
        coachPhone: coachInfo.phone,
        region: club.city, 
        logo: club.logo,
        athletes: athletes, // Embed the list of athletes
    };

    res.json(response);
});

// @desc    Create or Update a club
// @route   POST /api/clubs
// @access  Private/Coach
const createClub = asyncHandler(async (req, res) => {
    const { name, city, logo } = req.body;

    if (!name || !city) {
        res.status(400);
        throw new Error('Please provide all required fields: name, city');
    }

    const existingClub = await Club.findOne({ coach: req.user._id });

    if (existingClub) {
        existingClub.name = name || existingClub.name;
        existingClub.city = city || existingClub.city;
        existingClub.logo = logo !== undefined ? logo : existingClub.logo;

        const updatedClub = await existingClub.save();
        
        await User.findByIdAndUpdate(req.user._id, { club: updatedClub._id });

        return res.json(updatedClub);
    }

    const club = new Club({
        name,
        city,
        logo,
        coach: req.user._id,
    });

    const createdClub = await club.save();
    
    await User.findByIdAndUpdate(req.user._id, { club: createdClub._id });

    res.status(201).json(createdClub);
});

// @desc    Get all clubs for public listing
// @route   GET /api/clubs
// @access  Public
const getClubs = asyncHandler(async (req, res) => {
    const clubs = await Club.find({ coach: { $exists: true, $ne: null } })
        .populate('coach', 'firstName lastName phone')
        .lean();

    const clubsWithDetails = await Promise.all(clubs.map(async (club) => {
        const athleteCount = await User.countDocuments({
            club: club._id,
            role: 'athlete',
            clubStatus: 'approved'
        });

        const coachInfo = club.coach ? {
            name: `${club.coach.firstName} ${club.coach.lastName}`,
            phone: club.coach.phone || '—'
        } : {
            name: 'Тренер белгісіз',
            phone: '—'
        };

        return {
            _id: club._id,
            name: club.name,
            coachName: coachInfo.name,
            coachPhone: coachInfo.phone,
            athleteCount: athleteCount,
            region: club.city,
            logo: club.logo,
        };
    }));

    res.json(clubsWithDetails);
});

// @desc    Delete a club
// @route   DELETE /api/clubs/:id
// @access  Private/Admin
const deleteClub = asyncHandler(async (req, res) => {
    const clubId = req.params.id;

    const club = await Club.findById(clubId);

    if (!club) {
        res.status(404);
        throw new Error('Club not found');
    }

    // Step 1: Find all users associated with this club and clear their club affiliation
    await User.updateMany(
        { club: clubId },
        { $unset: { club: "" }, $set: { clubStatus: 'none' } } 
    );

    // Step 2: Delete the club itself
    await Club.findByIdAndDelete(clubId);

    res.json({ message: 'Club removed and athletes unlinked successfully' });
});


// ... (other existing functions like getMyClub, updateMyClub, etc.)

const getMyClub = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        return res.json(null); 
    }

    const pendingAthletes = await User.find({
        club: club._id,
        clubStatus: 'pending',
    }).select('-password');

    res.json({
        club,
        pendingAthletes,
    });
});

const updateMyClub = asyncHandler(async (req, res) => {
    const { name, city, logo } = req.body;

    const club = await Club.findOne({ coach: req.user._id });

    if (!club) {
        res.status(404);
        throw new Error('Клуб не найден. Вы не можете редактировать клуб, которого не существует.');
    }

    club.name = name || club.name;
    club.city = city || club.city;
    club.logo = logo !== undefined ? logo : club.logo; 

    const updatedClub = await club.save();

    res.json(updatedClub);
});

const getMyAthletes = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(404);
        throw new Error('You do not manage a club.');
    }

    const athletes = await User.find({
        club: club._id,
        clubStatus: 'approved'
    }).select('-password');
    
    res.json(athletes);
});

const respondToRequest = asyncHandler(async (req, res) => {
    const { athleteId, status } = req.body;

    if (!athleteId || !status || !['approved', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid input data.');
    }

    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(404);
        throw new Error('You do not manage a club.');
    }

    const athlete = await User.findById(athleteId);

    if (!athlete || !athlete.club || !athlete.club.equals(club._id) || athlete.clubStatus !== 'pending') {
        res.status(404);
        throw new Error('Athlete not found or request is not pending for this club.');
    }

    if (status === 'rejected') {
        athlete.club = undefined;
        athlete.clubStatus = 'none';
    } else {
        athlete.clubStatus = status;
    }
    
    await athlete.save();

    res.json({ message: `Athlete request has been ${status}.` });
});

const registerAthleteByCoach = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, gender, dateOfBirth, city, rank } = req.body;

    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(403);
        throw new Error('You are not authorized to perform this action because you do not have a club.');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists.');
    }

    const athlete = await User.create({
        firstName, lastName, email, password, gender, dateOfBirth, city, rank,
        role: 'athlete',
        club: club._id,
        clubStatus: 'approved',
    });

    res.status(201).json({
        _id: athlete._id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        email: athlete.email,
        role: athlete.role,
    });
});

module.exports = {
    createClub,
    getClubs,
    getClubById, // Exporting the new function
    deleteClub,
    getMyClub,
    updateMyClub,
    getMyAthletes,
    respondToRequest,
    registerAthleteByCoach,
};