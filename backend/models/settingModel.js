const mongoose = require('mongoose');

// Эта схема будет хранить один-единственный документ с настройками,
// который будет идентифицироваться по статичному ключу 'siteSettings'.

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'siteSettings',
        unique: true
    },
    siteName: {
        type: String,
        trim: true,
        default: 'Judo KZ Platform'
    },
    contactEmail: {
        type: String,
        trim: true,
        default: 'support@judokz.com'
    },
    contactPhone: {
        type: String,
        trim: true,
        default: '+7 (777) 000-00-00'
    },
    socialLinks: {
        instagram: { type: String, trim: true, default: '' },
        facebook: { type: String, trim: true, default: '' },
        telegram: { type: String, trim: true, default: '' }
    },
    // --- НОВЫЙ РАЗДЕЛ ДЛЯ ФУТЕРА ---
    footer: {
        brand: {
            logoText: { type: String, default: 'JUDO<span>KZ</span>' },
            description: { type: String, default: 'Орталықтандырылған платформа, спортшылар, клубтар мен турнирлерді басқаруға арналған.' }
        },
        nav: [
            {
                title: { type: String },
                links: [
                    { text: { type: String }, url: { type: String } }
                ]
            }
        ],
        widget: {
            statusText: { type: String, default: 'Барлық жүйелер жұмыс істеп тұр' } 
        },
        bottom: {
            watermark: { type: String, default: 'Judoka' },
            copyrightText: { type: String, default: 'Judo Federation KZ. Барлық құқықтар қорғалған.' },
            links: [
                { text: { type: String }, url: { type: String } }
            ]
        }
    }
}, { timestamps: true });

// Метод для "самозаполнения" настроек по умолчанию, если их нет
settingSchema.statics.initialize = async function () {
    const existing = await this.findOne({ key: 'siteSettings' });
    if (!existing) {
        console.log('Initializing default site settings...');
        await this.create({
            // Здесь можно оставить значения по умолчанию из схемы
            // или определить "стартовый" набор данных
            footer: { 
                nav: [
                    { title: 'Навигация', links: [{ text: 'Турнирлер', url: '/tournaments' }] },
                    { title: 'Ресурстар', links: [{ text: 'Қолдау', url: '/support' }] }
                ],
                bottom: {
                    links: [
                        { text: 'Құпиялылық саясаты', url: '/privacy' },
                        { text: 'Пайдалану шарттары', url: '/terms' }
                    ]
                }
            }
        });
    }
};

module.exports = mongoose.model('Setting', settingSchema);
