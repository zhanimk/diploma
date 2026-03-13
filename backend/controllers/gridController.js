const asyncHandler = require('express-async-handler');
const Grid = require('../models/gridModel');
const Match = require('../models/matchModel');

// @desc    Conduct a draw for a grid and create initial matches
// @route   POST /api/grids/:id/draw
// @access  Private(Admin)
const conductDraw = asyncHandler(async (req, res) => {
    const grid = await Grid.findById(req.params.id).populate('athletes');

    if (!grid) {
        res.status(404);
        throw new Error('Сетка не найдена');
    }

    if (grid.matches.length > 0) {
        // Очистить существующие матчи перед новой жеребьевкой
        await Match.deleteMany({ _id: { $in: grid.matches } });
    }

    // Простое перемешивание (алгоритм Фишера–Йетса)
    const athletes = [...grid.athletes];
    for (let i = athletes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [athletes[i], athletes[j]] = [athletes[j], athletes[i]];
    }

    const matches = [];
    const round = 1;

    for (let i = 0; i < athletes.length; i += 2) {
        if (i + 1 < athletes.length) {
            const match = new Match({
                tournament: grid.tournament,
                grid: grid._id,
                round,
                athlete1: athletes[i]._id,
                athlete2: athletes[i+1]._id,
                status: 'SCHEDULED',
            });
            matches.push(match);
        } else {
            // Если число нечетное, последний атлет проходит дальше
            const match = new Match({
                tournament: grid.tournament,
                grid: grid._id,
                round,
                athlete1: athletes[i]._id,
                winner: athletes[i]._id, // Автоматически становится победителем
                status: 'FINISHED',
            });
            matches.push(match);
        }
    }

    const createdMatches = await Match.insertMany(matches);

    grid.matches = createdMatches.map(m => m._id);
    grid.drawConducted = true;
    const updatedGrid = await grid.save();

    // Заполняем詳細 данными о матчах для ответа клиенту
    const populatedGrid = await Grid.findById(updatedGrid._id)
        .populate({
            path: 'matches',
            populate: [
                { path: 'athlete1', select: 'firstName lastName' },
                { path: 'athlete2', select: 'firstName lastName' },
                { path: 'winner', select: 'firstName lastName' },
            ]
        });

    res.status(201).json(populatedGrid);
});

module.exports = { conductDraw };
