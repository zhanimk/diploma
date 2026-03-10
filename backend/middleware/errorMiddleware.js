
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose CastError (e.g., invalid ObjectId)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'Resource not found';
    }

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
        // Extract messages from all validation errors
        const errorMessages = Object.values(err.errors).map(val => val.message);
        message = `Invalid input data: ${errorMessages.join('. ')}`;
    }
    
    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue);
        message = `Duplicate field value entered: ${field}. Please use another value!`;
    }


    res.status(statusCode);

    res.json({
        message: message,
        // Provide stack trace only in development environment
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};

module.exports = { notFound, errorHandler };
