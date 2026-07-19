import multer, { Multer, FileFilterCallback } from 'multer';
import { Request, Express } from 'express';

import { IError, Core as ErrorsCore } from '../core/errorAdapter';
import { ResponseError, InvalidError } from './defs';

import { UPLOAD_MAX_ALLOWED_FILES, UPLOAD_MAX_ALLOWED_FILES_SIZE } from '../core/constants/global';

function prepareResponse(response: any, data: any, responseSender: () => void, err?: ResponseError, non200Status?: number) {
    if (err) {
        response.status(err.status);
        if (err.error) {
            response.json({
                error: err.message,
                original: err.error.name,
                stack: err.error.stack,
            });
        } else {
            response.json({ error: err.message });
        }
    } else {
        if (data) {
            response.status(non200Status ?? 200);
            responseSender();
        } else {
            response.status(204);
            response.send();
        }
    }
}

export namespace appRoute {
    const servicesPrefix = {
        api: '/api',
    };

    export function getMap() {
        return {
            public: {
                test: '/',
                status: '/status',
            },
            user: {
                auth: {
                    confirm: `${servicesPrefix.api}/user/auth/confirm`,
                    edit: `${servicesPrefix.api}/user/auth/edit`,
                    login: `${servicesPrefix.api}/user/auth/login`,
                    me: `${servicesPrefix.api}/user/auth/me`,
                    refresh: `${servicesPrefix.api}/user/auth/refresh-token`,
                    register: `${servicesPrefix.api}/user/auth/register`,
                },
                stats: {
                    get: `${servicesPrefix.api}/user/stats`,
                },
            },
        };
    }
}

export namespace appRequest {
    export function setupUpload(): Multer {
        const storage = multer.memoryStorage();

        const upload = multer({
            storage,
            limits: {
                files: UPLOAD_MAX_ALLOWED_FILES,
                fileSize: UPLOAD_MAX_ALLOWED_FILES_SIZE * 1024 * 1024,
            },
            fileFilter(req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
                if (!/^image\//.test(file.mimetype) && !/^application\/pdf$/.test(file.mimetype)) {
                    callback(new Error('Incorrect file type'));
                    return;
                } else {
                    callback(null, true);
                }
            },
        });

        return upload;
    }
    export const upload = setupUpload();
}

export namespace appResponse {
    export function prepareJsonResponse(response: any, data: any, err?: ResponseError, non200Status?: number) {
        prepareResponse(
            response,
            data,
            () => {
                response.json(data);
            },
            err,
            non200Status
        );
    }

    export function prepareInvalidResponse(response: any, error: InvalidError): void {
        response.status(422).json(error);
    }

    export function prepareServerError(response: any) {
        response.status(500).send('Unexpected error.');
    }

    export function prepareErrorResponse(response: any, staticError: IError | null, details?: string) {
        if (!staticError) {
            staticError = ErrorsCore.Errors[ErrorsCore.ErrorsEnum.UNEXPECTED_ERROR];
        }
        return prepareResponse(
            response,
            staticError,
            () => {
                response.json({
                    ...staticError,
                    success: false,
                    details: (!['production'].includes(process.env.APP_MODE) && details) || null,
                });
            },
            null,
            staticError.httpCode
        );
    }
}
