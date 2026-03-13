const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Club = require('../models/clubModel');
const Tournament = require('../models/tournamentModel');
const generateToken = require('../utils/generateToken');
const { logAction } = require('../utils/auditLogger');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const {
        firstName, lastName, email, password, role, 
        gender, phoneNumber, dateOfBirth, weight, city, rank, club: clubId
    } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists.');
    }

    const userObject = {
        firstName,
        lastName,
        email,
        password,
        role,
        gender,
        city,
        rank,
        phone: phoneNumber,
        dateOfBirth: dateOfBirth || null,
    };

    // Robust weight handling for registration
    if (role === 'athlete') {
        const regWeight = req.body.weight;
        if (regWeight === null || regWeight === '' || regWeight === undefined) {
            userObject.weight = null;
        } else if (!isNaN(parseFloat(regWeight))) {
            userObject.weight = parseFloat(regWeight);
        }
    }

    if (role === 'athlete' && clubId) {
        const club = await Club.findById(clubId);
        if (!club) {
            res.status(404);
            throw new Error('Selected club not found.');
        }
        userObject.club = clubId;
    }

    const user = await User.create(userObject);

    if (user) {
        await logAction(user._id, 'REGISTER_USER', `Жаңа пайдаланушы ${user.email} тіркелді`);

        const userProfile = await User.findById(user._id).select('-password').populate('club', 'name city');

        if (userProfile) {
            res.status(201).json({
                ...userProfile.toObject(),
                token: generateToken(user._id),
            });
        } else {
             res.status(404);
             throw new Error('User not found after creation.');
        }
    } else {
        res.status(400);
        throw new Error('Invalid user data.');
    }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        const userProfile = await User.findById(user._id).select('-password').populate('club', 'name city');
        
        if (userProfile) {
            res.json({
                ...userProfile.toObject(),
                token: generateToken(user._id),
            });
        } else {
            res.status(404);
            throw new Error('User not found after login.');
        }
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
        throw new Error('User not found');
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.gender = req.body.gender || user.gender;

    if (req.body.city !== undefined) {
        user.city = req.body.city;
    }

    if (req.body.dateOfBirth !== undefined) {
        user.dateOfBirth = req.body.dateOfBirth || null;
    }

    if (user.role === 'athlete') {
        // Final, robust fix for weight update
        if (req.body.weight !== undefined) {
            const newWeight = req.body.weight;
            if (newWeight === null || newWeight === '') {
                user.weight = null;
            } else if (!isNaN(parseFloat(newWeight))) {
                user.weight = parseFloat(newWeight);
            }
        }
        if (req.body.rank !== undefined) {
            user.rank = req.body.rank;
        }
    }

    if (req.body.password) {
        user.password = req.body.password;
    }

    const savedUser = await user.save();

    const updatedUserProfile = await User.findById(savedUser._id)
        .select('-password')
        .populate('club', 'name city');

    res.json(updatedUserProfile.toObject());
});

const blockUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.isBlocked = !user.isBlocked;
        await user.save();

        const action = user.isBlocked ? 'BLOCK_USER' : 'UNBLOCK_USER';
        const description = `${user.firstName} ${user.lastName} пайдаланушысы ${user.isBlocked ? 'бұғатталды' : 'бұғаттан шығарылды'}`;
        await logAction(req.user._id, action, description);

        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.` });
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        const oldRole = user.role;
        const newRole = req.body.role;

        user.role = newRole || user.role;
        const updatedUser = await user.save();

        if (newRole && newRole !== oldRole) {
            await logAction(
                req.user._id, 
                'UPDATE_USER_ROLE', 
                `"${user.firstName}" рөлі "${oldRole}"-дан "${newRole}"-ға өзгертілді`
            );
        }

        const result = await User.findById(updatedUser._id).select('-password').populate('club', 'name');
        res.json(result);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const getAllUsers = asyncHandler(async (req, res) => {
    const { search, role } = req.query;
    let query = {};

    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
        ];
    }

    if (role) {
        query.role = role;
    }

    const users = await User.find(query).select('-password').populate('club', 'name');
    res.json(users);
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password').populate('club', 'name city');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found.');
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await User.deleteOne({_id: req.params.id});
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

const updateAthleteProfileByCoach = asyncHandler(async (req, res) => {
    const { athleteId } = req.params;
    const club = await Club.findOne({ coach: req.user._id });
    if (!club) {
        res.status(403);
        throw new Error('You are not authorized.');
    }
    const athlete = await User.findById(athleteId);
    if (!athlete || !athlete.club || !athlete.club.equals(club._id)) {
        res.status(404);
        throw new Error('Athlete not found in your club.');
    }
    athlete.firstName = req.body.firstName || athlete.firstName;
    athlete.lastName = req.body.lastName || athlete.lastName;
    athlete.dateOfBirth = req.body.dateOfBirth || athlete.dateOfBirth;
    athlete.rank = req.body.rank || athlete.rank;
    const updatedAthlete = await athlete.save();
    res.json(updatedAthlete);
});

const getAthleteTournaments = asyncHandler(async (req, res) => {
    const athleteId = req.params.id;
    const tournaments = await Tournament.find({ 'participants.athlete': athleteId }).populate('participants.athlete', 'firstName lastName');
    const history = tournaments.map(tourn => {
        const participantInfo = tourn.participants.find(p => p.athlete._id.toString() === athleteId);
        return { tournamentName: tourn.name, date: tourn.date, result: participantInfo ? participantInfo.status : 'unknown' };
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

    if (!athlete || !athlete.club || !athlete.club.equals(club._id)) {
        res.status(404);
        throw new Error('Athlete not found in your club.');
    }

    if (status === 'rejected') {
        athlete.club = null;
    }

    const savedAthlete = await athlete.save();
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
    updateUser,
    deleteUser,
    blockUser, 
    updateAthleteProfileByCoach,
    getAthleteTournaments,
    getStudentRequests,
    handleAthleteRequest
};