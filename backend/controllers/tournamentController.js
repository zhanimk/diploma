const asyncHandler = require('express-async-handler');
const Tournament = require('../models/tournamentModel');
const Application = require('../models/applicationModel');
const Grid = require('../models/gridModel');
const Match = require('../models/matchModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const { logAction } = require('../utils/auditLogger');

const createTournament = asyncHandler(async (req, res) => {
    const { name, startDate, endDate, location, registrationDeadline, tatamiCount, categories, regulationsPdf } = req.body;

    if (!name || !startDate || !endDate || !location || !registrationDeadline || !tatamiCount || !categories) {
        res.status(400); throw new Error('Не все обязательные поля были переданы.');
    }

    const tournament = new Tournament({
        name, startDate, endDate, location, registrationDeadline, tatamiCount, categories,
        status: 'REGISTRATION_OPEN', 
        regulationsPdf,
        createdBy: req.user._id,
    });

    const createdTournament = await tournament.save();

    // --- Логирование ---
    await logAction(req.user._id, 'CREATE_TOURNAMENT', `"${createdTournament.name}" турнирі құрылды`);

    // Отправка уведомлений тренерам
    try {
        const coaches = await User.find({ role: 'coach' }); 
        if (coaches.length > 0) {
            const notifications = coaches.map(coach => ({
                user: coach._id,
                message: `Жаңа турнир жарияланды: "${createdTournament.name}". Өтінімдерді қабылдау басталды.`,
                link: `/tournaments/${createdTournament._id}`
            }));
            await Notification.insertMany(notifications);
        }
    } catch (notificationError) {
        console.error('Ошибка при создании уведомлений для тренеров:', notificationError);
    }

    res.status(201).json(createdTournament);
});

const updateTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
        res.status(404); throw new Error('Турнир не найден');
    }

    // Обновление полей
    tournament.name = req.body.name || tournament.name;
    tournament.status = req.body.status || tournament.status;
    // ... (другие поля)

    const updatedTournament = await tournament.save();

    // --- Логирование ---
    await logAction(req.user._id, 'UPDATE_TOURNAMENT', `"${updatedTournament.name}" турнирі жаңартылды`);

    res.json(updatedTournament);
});

const deleteTournament = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    if (tournament) {
        const tournamentName = tournament.name;
        
        await Application.deleteMany({ tournament: req.params.id });
        await Match.deleteMany({ tournament: req.params.id });
        await Grid.deleteMany({ tournament: req.params.id });
        await Tournament.deleteOne({ _id: req.params.id });

        // --- Логирование ---
        await logAction(req.user._id, 'DELETE_TOURNAMENT', `"${tournamentName}" турнирі жойылды`);

        res.json({ message: 'Турнир успешно удален' });
    } else {
        res.status(404);
        throw new Error('Турнир не найден');
    }
});

// Остальные функции без изменений
const getAllTournaments = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({ status: { $ne: 'ARCHIVED' } }).sort({ startDate: -1 });
    res.json(tournaments);
});

const getAllTournamentsForAdmin = asyncHandler(async (req, res) => {
    const tournaments = await Tournament.find({}).sort({ startDate: -1 });
    res.json(tournaments);
});

const getTournamentById = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    if (tournament) {
        res.json(tournament);
    } else {
        res.status(404);
        throw new Error('Турнир не найден');
    }
});

const generateTournamentGrids = asyncHandler(async (req, res) => {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
        res.status(404);
        throw new Error('Турнир не найден');
    }

    const approvedApplications = await Application.find({
        tournament: tournament._id,
        status: 'APPROVED'
    }).populate('athletes.athlete', 'firstName lastName dateOfBirth gender belt');

    if (!approvedApplications || approvedApplications.length === 0) {
        res.status(400);
        throw new Error('Нет утвержденных заявок для генерации сеток.');
    }

    const allAthletes = approvedApplications.flatMap(app => app.athletes.map(entry => entry.toObject()));

    const groupedAthletes = {};
    const getAgeCategory = (athlete, tournamentCategories) => {
        const birthDate = new Date(athlete.dateOfBirth);
        const age = new Date(tournament.startDate).getFullYear() - birthDate.getFullYear();
        return tournamentCategories.find(cat => cat.gender === athlete.gender && age >= cat.ageFrom && age <= cat.ageTo);
    };

    allAthletes.forEach(entry => {
        const athleteInfo = entry.athlete;
        const ageCategory = getAgeCategory(athleteInfo, tournament.categories);
        if (!ageCategory) return; 

        const weightCategory = entry.weightCategory;
        const groupKey = `${ageCategory.gender}-${ageCategory.ageFrom}-${ageCategory.ageTo}-${weightCategory}`;

        if (!groupedAthletes[groupKey]) {
            groupedAthletes[groupKey] = {
                description: `${ageCategory.gender === 'MALE' ? 'Юноши' : 'Девушки'}, ${ageCategory.ageFrom}-${ageCategory.ageTo} лет, ${weightCategory} кг`,
                athletes: []
            };
        }
        groupedAthletes[groupKey].athletes.push(athleteInfo._id);
    });

    await Grid.deleteMany({ tournament: tournament._id });

    const gridsToCreate = Object.values(groupedAthletes).map(group => ({
        tournament: tournament._id,
        categoryDescription: group.description,
        athletes: group.athletes,
    }));

    if (gridsToCreate.length === 0) {
        res.status(400);
        throw new Error('Не удалось сформировать ни одной группы для сеток.');
    }

    const createdGrids = await Grid.insertMany(gridsToCreate);
    
    tournament.status = 'GRID_GENERATED';
    await tournament.save();

    res.status(201).json(createdGrids);
});

const getTournamentGrids = asyncHandler(async (req, res) => {
    const grids = await Grid.find({ tournament: req.params.id })
        .populate('athletes', 'firstName lastName')
        .sort('categoryDescription');
        
    if (!grids) {
        res.status(404);
        throw new Error('Сетки для этого турнира не найдены.');
    }
    res.json(grids);
});

module.exports = {
    createTournament,
    getAllTournaments,
    getAllTournamentsForAdmin,
    getTournamentById,
    updateTournament,
    deleteTournament,
    generateTournamentGrids,
    getTournamentGrids,
};