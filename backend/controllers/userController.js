const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Club = require('../models/clubModel');
const Tournament = require('../models/tournamentModel');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (athlete, coach, etc.)
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const {
        firstName, lastName, email, phone, password, role, gender, dateOfBirth, city, rank, club: clubId
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists.');
    }

    // Base user object now includes phone
    const userObject = {
        firstName, lastName, email, phone, password, role, gender, dateOfBirth, city, rank
    };

    if (role === 'athlete' && clubId) {
        const club = await Club.findById(clubId);
        if (!club) {
            res.status(404);
            throw new Error('Selected club not found.');
        }
        userObject.club = clubId;
        userObject.clubStatus = 'pending';
    }

    const user = await User.create(userObject);

    if (user) {
        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data.');
    }
});

// Other functions remain the same...


// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password.');
    }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password').populate('club', 'name city');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found.');
    }

    // Update general fields
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.city = req.body.city || user.city;
    user.gender = req.body.gender || user.gender;

    if (user.role === 'athlete') {
        user.weight = req.body.weight !== undefined ? req.body.weight : user.weight;
        user.rank = req.body.rank || user.rank;
    }

    if (req.body.password) {
        user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id), 
    });
});


// @desc    Get all users (for admin)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password').populate('club', 'name');
    res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password').populate('club', 'name city');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

// @desc    Update athlete profile by their coach
// @route   PUT /api/users/update-athlete/:athleteId
// @access  Private/Coach
const updateAthleteProfileByCoach = asyncHandler(async (req, res) => {
    const { athleteId } = req.params;

    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(403);
        throw new Error('You are not authorized to perform this action.');
    }

    const athlete = await User.findById(athleteId);

    if (!athlete || !athlete.club || !athlete.club.equals(club._id)) {
        res.status(404);
        throw new Error('Athlete not found in your club.');
    }

    athlete.firstName = req.body.firstName || athlete.firstName;
    athlete.lastName = req.body.lastName || athlete.lastName;
    athlete.dateOfBirth = req.body.dateOfBirth || athlete.dateOfBirth;
    athlete.city = req.body.city || athlete.city;
    athlete.rank = req.body.rank || athlete.rank;
    athlete.weight = req.body.weight || athlete.weight;

    const updatedAthlete = await athlete.save();
    res.json(updatedAthlete);
});

// @desc    Get athlete's tournament history
// @route   GET /api/users/:id/history
// @access  Public
const getAthleteTournaments = asyncHandler(async (req, res) => {
    const athleteId = req.params.id;
    const tournaments = await Tournament.find({ 'participants.athlete': athleteId })
        .populate('participants.athlete', 'firstName lastName');

    const history = tournaments.map(tourn => {
        const participantInfo = tourn.participants.find(p => p.athlete._id.toString() === athleteId);
        return {
            tournamentName: tourn.name,
            date: tourn.date,
            result: participantInfo ? participantInfo.status : 'unknown',
        };
    });

    res.json(history);
});

const getStudentRequests = asyncHandler(async (req, res) => {
    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(404);
        throw new Error('Club not found for this coach.');
    }

    const pendingAthletes = await User.find({
        club: club._id,
        clubStatus: 'pending',
        role: 'athlete'
    }).select('firstName lastName email dateOfBirth city');

    res.json(pendingAthletes);
});

const handleAthleteRequest = asyncHandler(async (req, res) => {
    const { athleteId, status } = req.body;
    const coachId = req.user._id;

    const club = await Club.findOne({ coach: coachId });
    if (!club) {
        res.status(403);
        throw new Error('You are not authorized to manage a club.');
    }

    const athlete = await User.findById(athleteId);

    if (!athlete || !athlete.club || !athlete.club.equals(club._id) || athlete.clubStatus !== 'pending') {
        res.status(404);
        throw new Error('No pending request found for this athlete in your club.');
    }

    if (status === 'approved') {
        athlete.clubStatus = 'approved';
    } else if (status === 'rejected') {
        // Now we can safely set club to null because it's not required.
        athlete.club = null;
        athlete.clubStatus = 'rejected'; 
    } else {
        res.status(400);
        throw new Error('Invalid status provided. Must be \'approved\' or \'rejected\'.');
    }

    const savedAthlete = await athlete.save();
    
    // Refetch the updated athlete with populated club data
    const updatedAthleteWithClub = await User.findById(savedAthlete._id).populate('club', 'name city');

    res.json({
        message: `Athlete request has been ${status}.`,
        athlete: updatedAthleteWithClub,
    });
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateAthleteProfileByCoach,
    getAthleteTournaments,
    getStudentRequests,
    handleAthleteRequest
};