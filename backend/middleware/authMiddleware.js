const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Получаем токен из заголовка (формат: "Bearer TOKEN")
      token = req.headers.authorization.split(' ')[1];

      // Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Находим пользователя по ID из токена и добавляем его в объект запроса
      // Исключаем поле с паролем
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Передаем управление следующему middleware
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Нет авторизации, токен недействителен'));
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Нет авторизации, токен отсутствует'));
  }
};

module.exports = { protect };
