import Joi from 'joi';
import { Schema, Document, model } from 'mongoose';

import { Helper } from '../shared/defs';
import { SchemasGlobal } from './';
import { ConstantsCountries, ConstantsGlobal } from '../core/constants';

interface IVerificationCodes {
    createdAt?: string;
    value?: string;
}

export interface IAccountBasic {
    cookiesAgreement?: boolean;
    confirmed?: boolean;
    countryCode?: string;
    email?: string;
    failedLoginAttempts?: number;
    firstName?: string;
    isEnabled?: boolean;
    lastName?: string;
    lastSeenAt?: string;
    latestFailedLoginAt?: string;
    latestUserAgentData?: string;
    role?: ConstantsGlobal.Account.ROLES_ENUM;
    rodoAgreement?: boolean;
    userInterfaceLanguage?: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES;
    verificationCodes?: IVerificationCodes[];
}
export interface IAccount extends IAccountBasic, SchemasGlobal.Schemas.IDocument {}
export interface IDBAccount extends IAccountBasic, Document {}
export type TBasicAccount = Pick<IAccount, '_id' | 'email' | 'firstName' | 'lastName' | 'role'>;

export interface SecuredAccount {
    cookiesAgreement: IAccount['cookiesAgreement'];
    countryCode: IAccount['countryCode'];
    email: IAccount['email'];
    _id: IAccount['_id'];
    firstName: IAccount['firstName'];
    lastName: IAccount['lastName'];
    role: IAccount['role'];
    rodoAgreement: IAccount['rodoAgreement'];
    userInterfaceLanguage: IAccount['userInterfaceLanguage'];
}

export const accountValidators = {
    cookiesAgreement: Joi.boolean().default(false).optional(),
    countryCode: Joi.string()
        .equal(...Object.values(ConstantsCountries._Enum))
        .default(ConstantsCountries._Enum.PL)
        .allow('')
        .optional(),
    email: Joi.string().email().optional(),
    firstName: Joi.string().allow('').optional(),
    isEnabled: Joi.boolean().optional(),
    lastName: Joi.string().allow('').optional(),
    lastSeenAt: Joi.string().optional(),
    rodoAgreement: Joi.boolean().default(false).optional(),
    role: Joi.string()
        .equal(...Object.values(ConstantsGlobal.Account.ROLES_ENUM))
        .default(ConstantsGlobal.Account.ROLES_ENUM.STUDENT)
        .optional(),
    userInterfaceLanguage: Joi.string()
        .equal(...Object.values(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES))
        .allow('', null)
        .optional(),
};

const AccountSchema = new Schema<IDBAccount>(
    {
        cookiesAgreement: {
            type: Boolean,
            default: false,
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.cookiesAgreement, val),
        },
        confirmed: {
            type: Boolean,
            default: false,
        },
        countryCode: {
            type: String,
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.countryCode, val),
            default: ConstantsCountries._Enum.PL,
        },
        email: {
            type: String,
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.email, val),
        },
        failedLoginAttempts: {
            type: Number,
        },
        firstName: {
            type: String,
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.firstName, val),
        },
        isEnabled: {
            type: Boolean,
            default: true,
        },
        lastName: {
            type: String,
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.lastName, val),
        },
        lastSeenAt: {
            type: String,
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.lastSeenAt, val),
        },
        latestFailedLoginAt: {
            type: String,
        },
        latestUserAgentData: {
            type: String,
        },
        rodoAgreement: {
            type: Boolean,
            default: false,
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.rodoAgreement, val),
        },
        role: {
            type: String,
            enum: Object.values(ConstantsGlobal.Account.ROLES_ENUM),
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.role, val),
        },
        userInterfaceLanguage: {
            type: String,
            enum: Object.values(ConstantsGlobal.App.USER_INTERFACE_LANGUAGES),
            validate: (val) => SchemasGlobal.Validators.schemaValidator(accountValidators.userInterfaceLanguage, val),
            default: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en,
        },
        verificationCodes: {
            type: [
                new Schema<IVerificationCodes>({
                    createdAt: {
                        type: String,
                    },
                    value: {
                        type: String,
                    },
                }),
            ],
        },
    },
    SchemasGlobal.Options.dbSchema
);

AccountSchema.index({ email: 1 });

export type TIndexes = 'email';

export const Account = model<IDBAccount>(Helper.prepareTableName('account'), AccountSchema);
