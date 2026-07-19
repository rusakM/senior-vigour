import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

import * as errorAdapter from '../../core/errorAdapter';
import { accountValidators } from '../../models/Account';

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object().keys({
        email: accountValidators.email,
    });

    const error: Joi.ValidationError = schema.validate(req.body).error;
    if (error) throw errorAdapter.Core.createError(errorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, { entity: 'Login credentials', details: error.details });

    return next();
};

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object().keys({
        cookiesAgreement: accountValidators.cookiesAgreement,
        countryCode: accountValidators.countryCode,
        email: accountValidators.email.required(),
        firstName: accountValidators.firstName,
        lastName: accountValidators.lastName,
        rodoAgreement: accountValidators.rodoAgreement,
        role: accountValidators.role,
        userInterfaceLanguage: accountValidators.userInterfaceLanguage,
    });

    const error: Joi.ValidationError = schema.validate(req.body).error;
    if (error) throw errorAdapter.Core.createError(errorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, { entity: 'Register credentials', details: error.details });

    return next();
};

export const validateConfirmation = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object().keys({
        email: accountValidators.email.required(),
        verificationCode: Joi.string().required(),
    });

    const error: Joi.ValidationError = schema.validate(req.body).error;
    if (error) throw errorAdapter.Core.createError(errorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, { entity: 'Confirmation data', details: error.details });

    return next();
};

export const editAccount = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object().keys(Object.fromEntries(Object.entries(accountValidators).map(([key, val]) => [key, val.optional()])));

    const error: Joi.ValidationError = schema.validate(req.body).error;
    if (error) throw errorAdapter.Core.createError(errorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, { entity: 'Account edit data', details: error.details });

    return next();
};
