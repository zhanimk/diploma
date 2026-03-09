const judge = (req, res, next) => {
    if (req.user && (req.user.role === 'judge' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as a judge');
    }
};

module.exports = { judge };
