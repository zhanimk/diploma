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
            ref: 'User',
            unique: true,
        },
        region: {
            type: String,
            required: [true, 'Please add a region'],
        },
        logo: {
            type: String, 
            default: '',
        },
        isVerified: { // Поле для верификации клуба
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

clubSchema.virtual('athletes', {
    ref: 'User',
    localField: '_id',
    foreignField: 'club',
    justOne: false,
    match: { role: 'athlete' }
});

module.exports = mongoose.model('Club', clubSchema);
