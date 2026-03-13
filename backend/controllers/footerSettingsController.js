const FooterSettings = require('../models/FooterSettings');

// Наш объект с данными по умолчанию. Он будет использован,
// если настроек в базе еще нет.
const defaultSettings = {
    brand: {
        logoText: "JUDO<span>KZ</span>",
        description: "Орталықтандырылған платформа, спортшылар, клубтар мен турнирлерді басқаруға арналған.",
        socials: [
            { label: "TG", url: "#" },
            { label: "YT", url: "#" },
            { label: "IG", url: "#" },
        ]
    },
    nav: [
        {
            title: "Навигация",
            links: [
                { text: "Турнирлер", url: "/tournaments" },
                { text: "Клубтар", url: "/clubs" },
                { text: "Рейтингтер", url: "/rankings" },
            ]
        },
        {
            title: "Ресустар",
            links: [
                { text: "Қолдау", url: "/support" },
                { text: "Құжаттама", url: "/docs" },
            ]
        }
    ],
    widget: {
        status: "Барлық жүйелер жұмыс істеп тұр",
        stats: [
            { value: "1,234", label: "Пайдаланушылар" },
            { value: "56", label: "Белсенді клубтар" }
        ]
    },
    bottom: {
        watermark: "Judoka",
        copyright: `© ${new Date().getFullYear()} Judo Federation KZ. Барлық құқықтар қорғалған.`,
        links: [
            { text: "Құпиялылық саясаты", url: "/privacy" },
            { text: "Пайдалану шарттары", url: "/terms" },
        ]
    }
};

// GET /api/settings/footer
// Получить настройки футера (публичный доступ)
exports.getFooterSettings = async (req, res) => {
    try {
        let settings = await FooterSettings.findOne({ singleton: 'footer-settings' });
        if (!settings) {
            // Если настроек нет, возвращаем дефолтные, но не сохраняем их.
            // Сохранение произойдет только при первом обновлении из админки.
            return res.json(defaultSettings);
        }
        res.json(settings);
    } catch (error) {
        console.error("Error fetching footer settings:", error);
        res.status(500).json({ message: "Server error while fetching settings." });
    }
};

// PUT /api/settings/footer
// Обновить настройки футера (только для админа)
exports.updateFooterSettings = async (req, res) => {
    try {
        // Ищем существующие настройки или создаем новый экземпляр, если их нет
        const settings = await FooterSettings.findOneAndUpdate(
            { singleton: 'footer-settings' }, // Условие поиска
            { ...req.body, singleton: 'footer-settings' }, // Данные для обновления/создания
            {
                new: true, // Вернуть обновленный документ
                upsert: true, // Создать, если не найден
                runValidators: true // Применить валидацию из схемы
            }
        );
        res.json(settings);
    } catch (error) {
        console.error("Error updating footer settings:", error);
        res.status(400).json({ message: "Error updating settings", details: error.message });
    }
};
