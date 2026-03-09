const adminOrJudge = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'judge')) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin or judge');
  }
};

module.exports = { adminOrJudge };