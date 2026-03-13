
const mongoose = require('mongoose');

// Эта схема будет использована для ОДНОГО документа в коллекции.
// Мы используем "singleton" паттерн для глобальных настроек сайта.

const LinkSchema = new mongoose.Schema({
    text: { type: String, required: true },
    url: { type: String, required: true, default: '#' }
});

const SocialLinkSchema = new mongoose.Schema({
    label: { type: String, required: true },
    url: { type: String, required: true, default: '#' }
});

const StatSchema = new mongoose.Schema({
    value: { type: String, required: true },
    label: { type: String, required: true }
});

const NavGroupSchema = new mongoose.Schema({
    title: { type: String, required: true },
    links: [LinkSchema]
});

const footerSettingsSchema = new mongoose.Schema({
    // Идентификатор для легкого поиска единственного документа
    singleton: {
        type: String,
        default: 'footer-settings',
        unique: true
    },
    brand: {
        logoText: { type: String, required: true },
        description: { type: String, required: true },
        socials: [SocialLinkSchema]
    },
    nav: [NavGroupSchema],
    widget: {
        status: { type: String, required: true },
        stats: [StatSchema]
    },
    bottom: {
        watermark: { type: String },
        copyright: { type: String },
        links: [LinkSchema]
    }
}, { timestamps: true });

const FooterSettings = mongoose.model('FooterSettings', footerSettingsSchema);

module.exports = FooterSettings;
