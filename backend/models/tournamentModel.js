
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    gender: {
        type: String,
        required: [true, 'Жынысы міндетті'],
        enum: ['male', 'female']
    },
    ageFrom: { 
        type: Number, 
        required: [true, 'Бастапқы жас міндетті'] 
    },
    ageTo: { 
        type: Number, 
        required: [true, 'Соңғы жас міндетті'] 
    },
    weights: {
        type: [Number],
        required: [true, 'Салмақ дәрежелері міндетті']
    }
}, { _id: false });

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Турнир атауы міндетті'],
        trim: true,
    },
    date: {
        type: Date,
        required: [true, 'Өткізілу күні міндетті'],
    },
    location: {
        type: String,
        required: [true, 'Өткізілу орны міндетті'],
    },
    registrationDeadline: {
        type: Date,
        required: [true, 'Тіркелудің соңғы мерзімі міндетті'],
    },
    tatamiCount: {
        type: Number,
        required: [true, 'Татами саны міндетті'],
        min: 1,
    },
    categories: [categorySchema],
    status: {
        type: String,
        required: true,
        enum: ['PLANNED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'GRID_GENERATED', 'ONGOING', 'COMPLETED'],
        default: 'PLANNED',
    },
    regulationsPdf: {
        type: String, 
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
});

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
