import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import * as errorAdapter from '../../core/errorAdapter';
import { ConstantsGlobal } from '../../core/constants';

export const validateGetQuestion = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object()
        .keys({
            questionNumber: Joi.number().integer().min(1).required(),
        })
        .unknown(true);

    const error: Joi.ValidationError = schema.validate(req.params).error;
    if (error) {
        throw errorAdapter.Core.createError(errorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, {
            entity: 'Get question',
            details: error.details,
        });
    }

    return next();
};

export const validateStartPoll = (req: Request, res: Response, next: NextFunction) => {
    const isMentor = req.params.role === ConstantsGlobal.Account.ROLES_ENUM.MENTOR;

    const schema = Joi.object()
        .keys({
            firstName: isMentor
                ? Joi.string().trim().min(1).required()
                : Joi.string().trim().allow('').optional(),
            lastName: isMentor
                ? Joi.string().trim().min(1).required()
                : Joi.string().trim().allow('').optional(),
        })
        .unknown(true);

    const error: Joi.ValidationError = schema.validate(req.body).error;
    if (error) {
        throw errorAdapter.Core.createError(errorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, {
            entity: 'Start poll',
            details: error.details,
        });
    }

    return next();
};

export const validateSendAnswer = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object().keys({
        questionNumber: Joi.number().integer().min(1).required(),
        response: Joi.string().allow(null, '').required(),
    });

    const error: Joi.ValidationError = schema.validate(req.body).error;
    if (error) {
        throw errorAdapter.Core.createError(errorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, {
            entity: 'Send answer',
            details: error.details,
        });
    }

    return next();
};
