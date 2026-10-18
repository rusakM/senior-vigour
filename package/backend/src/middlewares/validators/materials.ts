import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import * as errorAdapter from '../../core/errorAdapter';
import { ConstantsCourse } from '../../core/constants';

export const validateGetByCategory = (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object().keys({
        category: Joi.string()
            .valid(...Object.values(ConstantsCourse.Module.CATEGORY))
            .required(),
    }).unknown(true);

    const error: Joi.ValidationError = schema.validate(req.params).error;
    if (error) throw errorAdapter.Core.createError(errorAdapter.Core.ErrorsEnum.VALIDATION_ERROR, { entity: 'Category', details: error.details });

    return next();
};
