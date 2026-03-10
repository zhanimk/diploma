
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Tournament = require('../models/tournamentModel');
const Application = require('../models/applicationModel');
const Grid = require('../models/gridModel');
const Match = require('../models/matchModel');
const User = require('../models/userModel');

// ... (Тут находятся createTournament, getAllTournaments, и т.д. Оставим их без изменений)
const createTournament = asyncHandler(async (req, res) => {
    const {
        name, date, location, registrationDeadline, tatamiCount, categories, status, regulationsPdf
    } = req.body;
    if (!name || !date || !location || !registrationDeadline || !tatamiCount || !categories) {
        res.status(400);
        throw new Error('Please fill all required fields');
    }
    const tournament = new Tournament({
        name, date, location, registrationDeadline, tatamiCount, categories,
        status: status || 'PLANNED',
        regulationsPdf,
        createdBy: req.user._id,
    });
    const createdTournament = await tournament.save();
    res.status(201).json(createdTournament);
});
const getAllTournaments = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({ status: 'REGISTRATION_OPEN' }).sort({ date: -1 });
    res.json(tournaments);
});
const getAllTournamentsForAdmin = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({}).sort({ date: -1 });
    res.json(tournaments);
});
const getTournamentById = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id).populate('categories.age').populate('categories.weights');
    if (tournament) {
        res.json(tournament);
    } else {
        res.status(404);
        throw new Error('Tournament not found');
    }
});
const updateTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    if (tournament) {
        tournament.name = req.body.name || tournament.name;
        tournament.date = req.body.date || tournament.date;
        tournament.location = req.body.location || tournament.location;
        tournament.registrationDeadline = req.body.registrationDeadline || tournament.registrationDeadline;
        tournament.tatamiCount = req.body.tatamiCount || tournament.tatamiCount;
        tournament.categories = req.body.categories || tournament.categories;
        tournament.status = req.body.status || tournament.status;
        tournament.regulationsPdf = req.body.regulationsPdf || tournament.regulationsPdf;
        const updatedTournament = await tournament.save();
        res.json(updatedTournament);
    } else {
        res.status(404);
        throw new Error('Tournament not found');
    }
});
const deleteTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    if (tournament) {
        await Match.deleteMany({ tournament: req.params.id });
        await Grid.deleteMany({ tournament: req.params.id });
        await Tournament.deleteOne({ _id: req.params.id });
        res.json({ message: 'Tournament removed' });
    } else {
        res.status(404);
        throw new Error('Tournament not found');
    }
});

// @desc    Get all grids for a tournament
// @route   GET /api/tournaments/:id/grids
// @access  Private/Admin
const getTournamentGrids = asyncHandler(async (req, res) => {
    const tournamentId = req.params.id;

    const grids = await Grid.find({ tournament: tournamentId })
        .populate('athletes', 'firstName lastName')
        .populate({
            path: 'matches',
            populate: [
                { path: 'athlete1', select: 'firstName lastName' },
                { path: 'athlete2', select: 'firstName lastName' },
                { path: 'winner', select: 'firstName lastName' }
            ]
        });

    const tournament = await Tournament.findById(tournamentId, 'name date');

    if (!tournament) {
        res.status(404);
        throw new Error('Турнир не найден');
    }

    res.json({
        tournament,
        grids
    });
});


const generateTournamentGrid = asyncHandler(async (req, res) => {
    const tournamentId = req.params.id;
    const tournament = await Tournament.findById(tournamentId).populate('categories.age').populate('categories.weights');
    if (!tournament) {
        res.status(404);
        throw new Error('Турнир не найден');
    }
    await Match.deleteMany({ tournament: tournamentId });
    await Grid.deleteMany({ tournament: tournamentId });
    const applications = await Application.find({
        tournament: tournamentId,
        status: 'APPROVED'
    }).populate('athletes.athlete');
    let allAthletes = [];
    applications.forEach(app => {
        app.athletes.forEach(athleteEntry => {
            if (athleteEntry.isVerifiedByAdmin) {
                allAthletes.push({ ...athleteEntry.toObject(), coachInfo: app.coach });
            }
        });
    });
    if (allAthletes.length === 0) {
        res.status(400);
        throw new Error('Нет верифицированных спортсменов для создания сеток.');
    }
    const athletesByCategory = {};
    allAthletes.forEach(athlete => {
        const key = `${athlete.ageCategory}-${athlete.weightCategory}`;
        if (!athletesByCategory[key]) athletesByCategory[key] = [];
        athletesByCategory[key].push(athlete);
    });
    let gridsCreatedCount = 0;
    for (const key in athletesByCategory) {
        const athletesInGroup = athletesByCategory[key];
        const [ageCatId, weightCatId] = key.split('-');
        if (athletesInGroup.length < 2) continue;
        const ageCategory = tournament.categories.flatMap(c => c.age).find(a => a._id.equals(ageCatId));
        const weightCategory = tournament.categories.flatMap(c => c.weights).find(w => w._id.equals(weightCatId));
        if(!ageCategory || !weightCategory) continue;
        let gridType, matches = [], rootMatchId = null;
        if (athletesInGroup.length <= 4) {
            gridType = 'ROUND_ROBIN';
            matches = await generateRoundRobin(tournamentId, athletesInGroup);
        } else {
            gridType = 'OLYMPIC';
            const { generatedMatches, root } = await generateOlympicGrid(tournamentId, athletesInGroup);
            matches = generatedMatches;
            rootMatchId = root._id;
        }
        if (matches.length > 0) {
             const newGrid = new Grid({
                tournament: tournamentId, ageCategory: ageCatId, weightCategory: weightCatId,
                categoryName: `${ageCategory.name}, ${weightCategory.weight} кг`,
                gridType, athletes: athletesInGroup.map(a => a.athlete._id),
                matches: matches.map(m => m._id), rootMatch: rootMatchId
            });
            await newGrid.save();
            await Match.updateMany({ _id: { $in: matches.map(m => m._id) } }, { grid: newGrid._id });
            gridsCreatedCount++;
        }
    }
    if (gridsCreatedCount > 0) {
        tournament.status = 'GRID_GENERATED';
        await tournament.save();
        res.json({ message: `Сетки успешно сгенерированы! Создано ${gridsCreatedCount} сеток.` });
    } else {
        res.status(400);
        throw new Error('Не удалось создать ни одной сетки.');
    }
});

async function generateRoundRobin(tournamentId, athletes) {
    let matches = [];
    for (let i = 0; i < athletes.length; i++) {
        for (let j = i + 1; j < athletes.length; j++) {
            matches.push(new Match({ tournament: tournamentId, round: 1, matchNumber: matches.length + 1, athlete1: athletes[i].athlete._id, athlete2: athletes[j].athlete._id, status: 'PENDING', grid: new mongoose.Types.ObjectId() }));
        }
    }
    return await Match.insertMany(matches);
}

async function generateOlympicGrid(tournamentId, athletes) {
    let shuffledAthletes = shuffleWithClubSeparation(athletes);
    const totalAthletes = shuffledAthletes.length, rounds = Math.ceil(Math.log2(totalAthletes));
    let matches = [], currentRoundAthletes = [], matchNumber = 1;
    let athletePool = [...shuffledAthletes];
    for (let i = 0; i < (totalAthletes - (Math.pow(2, rounds) - totalAthletes)); i++) {
        const match = new Match({ tournament: tournamentId, round: 1, matchNumber: matchNumber++, athlete1: athletePool.pop().athlete._id, athlete2: athletePool.pop().athlete._id, status: 'PENDING', grid: new mongoose.Types.ObjectId() });
        matches.push(match);
        currentRoundAthletes.push(match);
    }
    while(athletePool.length > 0) currentRoundAthletes.push({ isBye: true, athlete: athletePool.pop() });
    for (let round = 2; round <= rounds; round++) {
        let nextRoundMatches = [];
        for (let i = 0; i < currentRoundAthletes.length; i += 2) {
            const match = new Match({ tournament: tournamentId, round: round, matchNumber: matchNumber++, status: 'PENDING', grid: new mongoose.Types.ObjectId() });
            const p1 = currentRoundAthletes[i], p2 = currentRoundAthletes[i+1];
            if (p1.isBye) match.athlete1 = p1.athlete.athlete._id; else p1.nextMatch = match._id;
            if (p2.isBye) match.athlete2 = p2.athlete.athlete._id; else p2.nextMatch = match._id;
            matches.push(match);
            nextRoundMatches.push(match);
        }
        currentRoundAthletes = nextRoundMatches;
    }
    const savedMatches = await Match.insertMany(matches);
    for (const match of savedMatches) {
        if(match.nextMatch) await Match.updateOne({ _id: match._id }, { nextMatch: match.nextMatch });
    }
    const rootMatch = savedMatches.find(m => m.round === rounds);
    return { generatedMatches: savedMatches, root: rootMatch };
}

function shuffleWithClubSeparation(athletes) {
    let currentIndex = athletes.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [athletes[currentIndex], athletes[randomIndex]] = [athletes[randomIndex], athletes[currentIndex]];
    }
    return athletes;
}

module.exports = {
    createTournament,
    getAllTournaments,
    getAllTournamentsForAdmin,
    getTournamentById,
    updateTournament,
    deleteTournament,
    generateTournamentGrid,
    getTournamentGrids, // Добавили экспорт
};
