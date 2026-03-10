const mongoose = require('mongoose');

const clubSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a club name'],
            unique: true,
        },
        coach: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true, // Each coach can only have one club
        },
        city: {
            type: String,
            required: [true, 'Please add a city'],
        },
        logo: {
            type: String, // URL to the club logo
            default: '', // Default to an empty string
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Club', clubSchema);
