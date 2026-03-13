const jwt = require('jsonwebtoken');
const User = require('../models/userModel.js');
const asyncHandler = require('express-async-handler');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Получаем токен из хедера
      token = req.headers.authorization.split(' ')[1];

      // Проверяем, что токен не является "пустышкой"
      if (!token || token === 'null' || token === 'undefined') {
        res.status(401);
        throw new Error('Not authorized, no token provided');
      }

      // Верифицируем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Находим пользователя по ID из токена и добавляем его в объект запроса
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const coach = (req, res, next) => {
  if (req.user && req.user.role === 'coach') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as a coach');
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, coach, admin };
