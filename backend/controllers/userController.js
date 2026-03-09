const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

// Helper to create user payload for responses
const createUserPayload = (user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    club: user.club,
    city: user.city,
    token: generateToken(user._id),
});

// --- Основные функции --- //

const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, role, ...optionalFields } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400); throw new Error('User with this email already exists');
  }
  const user = await User.create({ firstName, lastName, email, password, role, ...optionalFields });
  if (user) {
    res.status(201).json(createUserPayload(user));
  } else {
    res.status(400); throw new Error('Invalid user data');
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json(createUserPayload(user));
  } else {
    res.status(401); throw new Error('Invalid email or password');
  }
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (user) { res.json(user); } else { res.status(404); throw new Error('User not found'); }
});

const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
        user.club = req.body.club || user.club;
        user.city = req.body.city || user.city;
        if (req.body.password) { user.password = req.body.password; }
        const updatedUser = await user.save();
        res.json(createUserPayload(updatedUser));
    } else {
        res.status(404); throw new Error('User not found');
    }
});

// --- Новая логика: Спортсмен отправляет запрос тренеру --- //

const sendRequestToCoach = asyncHandler(async (req, res) => {
    const { coachId } = req.body;
    const athleteId = req.user._id;

    const coach = await User.findById(coachId);
    const athlete = await User.findById(athleteId);

    if (!coach || coach.role !== 'coach') {
        res.status(404); throw new Error('Coach not found');
    }
    if (athlete.coach) {
        res.status(400); throw new Error('You already have a coach');
    }
    if (coach.studentRequests.some(req => req.student.toString() === athleteId.toString())) {
        res.status(400); throw new Error('Request already sent');
    }

    coach.studentRequests.push({ student: athleteId, status: 'pending' });
    await coach.save();

    res.status(201).json({ message: 'Request sent successfully' });
});

const getStudentRequests = asyncHandler(async (req, res) => {
    const coach = await User.findById(req.user._id).populate('studentRequests.student', 'firstName lastName email');
    res.json(coach.studentRequests);
});

const respondToStudentRequest = asyncHandler(async (req, res) => {
    const { studentId, accept } = req.body;
    const coachId = req.user._id;

    const coach = await User.findById(coachId);
    const student = await User.findById(studentId);

    if (!student) { res.status(404); throw new Error('Student not found'); }

    const request = coach.studentRequests.find(req => req.student.toString() === studentId.toString() && req.status === 'pending');
    if (!request) { res.status(404); throw new Error('Request not found or already handled'); }

    if (accept) {
        request.status = 'accepted';
        student.coach = coachId;
        coach.students.push(studentId);
        await User.updateMany({}, { $pull: { studentRequests: { student: studentId } } });
        await student.save();
    } else {
        request.status = 'rejected';
    }

    await coach.save();
    res.json({ message: `Request ${accept ? 'accepted' : 'rejected'}` });
});

// --- Другие функции --- //

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

// @desc    Get all coaches
// @route   GET /api/users/coaches
// @access  Private
const getCoaches = asyncHandler(async (req, res) => {
  const coaches = await User.find({ role: 'coach' }).select('-password');
  res.json(coaches);
});

const getCoachStudents = asyncHandler(async (req, res) => {
    const coach = await User.findById(req.user._id).populate('students', 'firstName lastName email');
    if(coach) res.json(coach.students);
    else { res.status(404); throw new Error("Coach not found"); }
});

const removeStudent = asyncHandler(async (req, res) => {
    const { studentId } = req.body;
    const coach = await User.findById(req.user._id);
    const student = await User.findById(studentId);
    if (coach && student) {
        coach.students.pull(studentId);
        student.coach = null;
        await coach.save();
        await student.save();
        res.json({ message: 'Student removed' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getCoaches, // <-- Экспортируем новую функцию
  sendRequestToCoach,
  getStudentRequests,
  respondToStudentRequest,
  getCoachStudents,
  removeStudent,
};