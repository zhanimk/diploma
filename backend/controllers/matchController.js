const asyncHandler = require('express-async-handler');
const Match = require('../models/matchModel');
const Grid = require('../models/gridModel');

// @desc    Update match details, set winner, and advance to next round
// @route   PUT /api/matches/:id
// @access  Private(Admin)
const updateMatch = asyncHandler(async (req, res) => {
    const { winnerId } = req.body;
    const match = await Match.findById(req.params.id);

    if (!match) {
        res.status(404);
        throw new Error('Матч не найден');
    }

    if (!winnerId) {
        res.status(400);
        throw new Error('Необходимо указать ID победителя');
    }

    const winner = [match.athlete1, match.athlete2].find(id => id.toString() === winnerId);
    if (!winner) {
        res.status(400);
        throw new Error('Указанный победитель не является участником этого матча');
    }

    const loser = [match.athlete1, match.athlete2].find(id => id.toString() !== winnerId);

    match.winner = winner;
    match.loser = loser || null; // loser может быть null если был bye
    match.status = 'FINISHED';
    await match.save();

    // --- Логика продвижения по сетке ---
    if (match.nextMatch) {
        const nextMatch = await Match.findById(match.nextMatch);
        if (!nextMatch) {
             console.error(`Следующий матч с ID ${match.nextMatch} не найден!`);
             // Можно просто вернуть обновленный матч, если следующего нет
        } else {
             // Определяем, в какой слот поставить победителя
            if (!nextMatch.athlete1) {
                nextMatch.athlete1 = winner;
            } else if (!nextMatch.athlete2) {
                nextMatch.athlete2 = winner;
            }
            await nextMatch.save();
        }
    }

    // После обновления матча, нужно вернуть всю сетку в актуальном состоянии
    const grid = await Grid.findById(match.grid)
        .populate({
            path: 'matches',
            populate: [
                { path: 'athlete1', select: 'firstName lastName' },
                { path: 'athlete2', select: 'firstName lastName' },
                { path: 'winner', select: 'firstName lastName' },
            ]
        });

    res.json(grid);
});

module.exports = { updateMatch };
