import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../core/errorAdapter';

export function errorHandler(error: Error, request: Request, response: Response, next: NextFunction): void {
    if (error instanceof ApiError) {
        const message = `Error: [Message: ${error.message}] [Route: ${request.originalUrl}]  [Details: ${JSON.stringify(error.data ?? {})}]`;
        console.error(message);

        if (error.httpCode >= 500)
            console.error({
                ...error,
                stack: error.stack,
                route: request.originalUrl,
            });

        return void response.status(error.httpCode).json({
            route: request.originalUrl,
            success: false,
            name: error.name,
            message: error.message,
            httpCode: error.httpCode,
            type: error.type,
            data: error.data ?? {},
        });
    }

    console.error({ ...error, stack: error.stack, route: request.originalUrl });

    response.status(500).json({
        route: request.originalUrl,
        success: false,
        message: 'Unexpected error',
    });
}
