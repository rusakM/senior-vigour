import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { Types } from 'mongoose';
import * as ErrorAdapter from '../core/errorAdapter';
import { IDecodedToken } from '../shared/defs';
import { ConstantsEnv, ConstantsGlobal } from '../core/constants';
import { correlationContext } from './correlation.context';

function validateToken(token: string) {
    validateTokenAndGetPayload(token);
}

function validateTokenAndGetPayload(token: string, options?: any): any {
    const secret = ConstantsEnv.Main.JWT_SECRET;
    let response: any;

    jwt.verify(token, secret, options, (error, data) => {
        if (error) throw error;
        response = data;
    });

    return response;
}

function retractRequestToken(request: any): string {
    let token = '';

    if (request.headers['authorization']) {
        const auth = request.headers['authorization'];
        const elements = auth.split(' ');
        if (elements.length == 2 && elements[0].toLowerCase() == 'bearer') {
            token = elements[1];
        } else {
            throw Error('Incorrect authentication type.');
        }
    } else {
        throw Error('Not authenticated.');
    }

    return token;
}

function processValidateAuthenticatedRequest(errorCode: number, request: any, response: any, next: any, options?: any) {
    request.params.userId = undefined;
    request.params.role = undefined;

    try {
        const payload = validateTokenAndGetPayload(retractRequestToken(request), options);
        request.params.userId = payload.id;
        request.params.role = payload.role;

        correlationContext.setUserId(request.params.userId);

        next();
    } catch (error) {
        response.status(errorCode);
        response.json({ error: error.message });
        return;
    }
}

export function emptyBody(req: Request) {
    req.body = {};
    return req;
}

export namespace security {
    export function generateGeneralToken(): string {
        //just temporary
        return generateSpecificToken({}, '1h');
    }

    export function generateSpecificToken(payload: IDecodedToken, expiration: jwt.SignOptions['expiresIn']): string {
        const secret = ConstantsEnv.Main.JWT_SECRET;

        return jwt.sign(payload, secret, { expiresIn: expiration });
    }

    export function emptyValidator(request: any, response: any, next: any) {
        next();
    }

    export function validateParams(request: Request, response: any, next: any) {
        for (const param in request.params) {
            if (/Id$/.test(param)) {
                if (!Types.ObjectId.isValid(request.params?.[param]?.toString())) throw ErrorAdapter.Core.createError(ErrorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, { details: 'Invalid path params.' });
            }
        }

        next();
    }

    export function validateRequest(request: any, response: any, next: any) {
        try {
            validateToken(retractRequestToken(request));
            next();
        } catch (error) {
            response.status(401);
            response.json({ error: error.message });
            return;
        }
    }

    export function validateAuthenticatedRequest(request: any, response: any, next: any) {
        processValidateAuthenticatedRequest(401, request, response, next);
    }

    export function validateRefreshRequest(request: any, response: any, next: any) {
        processValidateAuthenticatedRequest(403, request, response, next, {
            ignoreExpiration: true,
        });
    }

    export function validateStudentRequest(request: any, response: any, next: any) {
        if (request.params.role === ConstantsGlobal.Account.ROLES_ENUM.STUDENT) {
            next();
        } else {
            response.status(403);
            response.json({ error: 'Insufficient priviledge.' });
        }
    }

    export function validateTeacherRequest(request: any, response: any, next: any) {
        if (request.params.role === ConstantsGlobal.Account.ROLES_ENUM.TEACHER) {
            next();
        } else {
            response.status(403);
            response.json({ error: 'Insufficient priviledge.' });
        }
    }
}
