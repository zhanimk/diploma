const asyncHandler = require('express-async-handler');
const Club = require('../models/clubModel');
const User = require('../models/userModel');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all clubs with filtering by verification status
// @route   GET /api/clubs
// @access  Public (conditionally private for admin)
const getClubs = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = {};

    // If not an admin, only show verified clubs
    if (req.user?.role !== 'admin') {
        filter.isVerified = true;
    }

    // Admin can filter by status
    if (req.user?.role === 'admin') {
        if (status === 'verified') {
            filter.isVerified = true;
        } else if (status === 'pending') {
            filter.isVerified = false;
        }
    }

    const clubs = await Club.find(filter).populate('coach', 'firstName lastName email phone').populate('athletes');
    
    // Admin gets more details
    if (req.user?.role === 'admin') {
        const clubsWithDetails = clubs.map(club => ({
            _id: club._id,
            name: club.name,
            region: club.region,
            isVerified: club.isVerified,
            coachName: club.coach ? `${club.coach.firstName} ${club.coach.lastName}` : 'Тренер не назначен',
            coachPhone: club.coach ? club.coach.phone || 'Не указан' : '-',
            athleteCount: club.athletes ? club.athletes.length : 0
        }));
        return res.json(clubsWithDetails);
    }

    // Public response is simpler
    res.json(clubs);
});

// @desc    Get a single club by ID
// @route   GET /api/clubs/:id
// @access  Public
const getClubById = asyncHandler(async (req, res) => {
    const club = await Club.findById(req.params.id)
        .populate('coach', 'firstName lastName email phone')
        .populate('athletes', 'firstName lastName dateOfBirth gender');
    if (club) {
        res.json(club);
    } else {
        res.status(404);
        throw new Error('Club not found');
    }
});

// @desc    Verify a club
// @route   PUT /api/clubs/:id/verify
// @access  Private/Admin
const verifyClub = asyncHandler(async (req, res) => {
    const club = await Club.findById(req.params.id);

    if (club) {
        club.isVerified = true;
        const updatedClub = await club.save();

        await logAction(req.user._id, 'VERIFY_CLUB', `"${club.name}" клубы тексерістен өтті`);

        res.json(updatedClub);
    } else {
        res.status(404);
        throw new Error('Club not found');
    }
});

// @desc    Create a new club
// @route   POST /api/clubs
// @access  Private/Coach
const createClub = asyncHandler(async (req, res) => {
    const { name, region, description, phone, address, website } = req.body;
    const coachId = req.user._id;

    const clubExists = await Club.findOne({ coach: coachId });
    if (clubExists) {
        res.status(400);
        throw new Error('You already have a club.');
    }
    const club = await Club.create({ 
        name, 
        region, 
        coach: coachId,
        description,
        phone,
        address,
        website
    });
    await User.findByIdAndUpdate(coachId, { club: club._id });

    await logAction(req.user._id, 'CREATE_CLUB', `"${name}" жаңа клубы құрылды`);

    res.status(201).json(club);
});

// @desc    Update a club (for Admin)
// @route   PUT /api/clubs/:id
// @access  Private/Admin
const updateClub = asyncHandler(async (req, res) => {
    const club = await Club.findById(req.params.id);
    if (club) {
        const { name, region, coachId, description, phone, address, website, logo } = req.body;
        
        club.name = name || club.name;
        club.region = region || club.region;
        club.description = description || club.description;
        club.phone = phone || club.phone;
        club.address = address || club.address;
        club.website = website || club.website;
        club.logo = logo || club.logo;

        if (coachId && coachId.toString() !== (club.coach ? club.coach.toString() : null)) {
            if (club.coach) await User.findByIdAndUpdate(club.coach, { $unset: { club: '' } });
            await User.findByIdAndUpdate(coachId, { club: club._id });
            club.coach = coachId;
        }
        
        const updatedClub = await club.save();
        await logAction(req.user._id, 'UPDATE_CLUB', `Администратор клубының деректерін жаңартты "${club.name}"`);
        res.json(updatedClub);
    } else {
        res.status(404);
        throw new Error('Club not found');
    }
});

// @desc    Delete a club
// @route   DELETE /api/clubs/:id
// @access  Private/Admin
const deleteClub = asyncHandler(async (req, res) => {
    const club = await Club.findById(req.params.id);
    if (club) {
        const clubName = club.name;
        await User.updateMany({ club: club._id }, { $unset: { club: '' } });
        await Club.deleteOne({ _id: club._id });

        await logAction(req.user._id, 'DELETE_CLUB', `"${clubName}" клубы жойылды`);

        res.json({ message: 'Club removed' });
    } else {
        res.status(404);
        throw new Error('Club not found');
    }
});

// @desc    Get the club of the currently logged-in coach
// @route   GET /api/clubs/my-club
// @access  Private/Coach
const getMyClub = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id }).populate('athletes');
    if (club) {
        res.json(club);
    } else {
        res.status(404);
        throw new Error('Club not found for this coach');
    }
});

// @desc    Update the club of the currently logged-in coach
// @route   PUT /api/clubs/my-club
// @access  Private/Coach
const updateMyClub = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id });

    if (club) {
        const { name, region, description, phone, address, website, logo } = req.body;

        club.name = name || club.name;
        club.region = region || club.region;
        club.description = description !== undefined ? description : club.description;
        club.phone = phone !== undefined ? phone : club.phone;
        club.address = address !== undefined ? address : club.address;
        club.website = website !== undefined ? website : club.website;
        club.logo = logo !== undefined ? logo : club.logo;

        const updatedClub = await club.save();
        
        await logAction(req.user._id, 'UPDATE_MY_CLUB', `"${club.name}" клубының деректері жаңартылды`);

        res.json(updatedClub);
    } else {
        res.status(404);
        throw new Error('Club not found for this coach');
    }
});


// --- Deprecated or other specific routes ---

const getMyAthletes = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(404); throw new Error('Club not found');
    }
    const athletes = await User.find({ role: 'athlete', club: club._id });
    res.json(athletes);
});

const respondToRequest = asyncHandler(async (req, res) => {
    res.status(400).json({ message: 'This endpoint is deprecated. Please use /api/users/handle-request.' });
});

const registerAthleteByCoach = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id });
    if (!club) { res.status(403); throw new Error('You do not have a club.'); }

    const { firstName, lastName, email, password, gender, dateOfBirth, city, rank } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) { res.status(400); throw new Error('User already exists'); }

    const athlete = await User.create({
        firstName, lastName, email, password, gender, dateOfBirth, city, rank,
        role: 'athlete',
        club: club._id,
    });

    if (athlete) {
        res.status(201).json({ _id: athlete._id, firstName: athlete.firstName, email: athlete.email });
    } else {
        res.status(400); throw new Error('Invalid athlete data');
    }
});


module.exports = { 
    getClubs, 
    verifyClub, 
    getClubById, 
    createClub, 
    updateClub, 
    deleteClub,
    getMyClub,
    updateMyClub,
    getMyAthletes,
    respondToRequest,
    registerAthleteByCoach
};