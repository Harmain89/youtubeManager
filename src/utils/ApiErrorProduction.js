// errorHandler.js
import { ApiError } from '../utils/ApiError.js';

const ApiErrorProduction = (err, req, res, next) => {
    // Check if the error is an instance of ApiError
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || []
        });
    }

    // Handle Mongoose CastError separately
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`,
            errors: [{ path: err.path, value: err.value }]
        });
    }

    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        errors: [err.message]
    });
};

export { ApiErrorProduction }
