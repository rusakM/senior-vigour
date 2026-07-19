import { addMinutes, isAfter, isBefore } from 'date-fns';
import * as model from '../models/Account';
export import Model = model;
import { dbConnector } from '../core';
import { ConstantsGlobal } from '../core/constants';
import * as errorsAdapter from '../core/errorAdapter';
import { Helper } from '../shared/defs';

class dbConnectorAccount extends dbConnector<Model.IDBAccount, Model.IAccount, Model.TIndexes> {
    constructor() {
        super(Model.Account);
    }

    findByEmail = async (email: Model.IAccount['email']): Promise<Model.IAccount> => {
        try {
            if (!email) throw new Error('Email is required.');
            const results = await this.Model.find({ email }).limit(1).lean().exec();

            return results?.length ? (results[0] as unknown as Model.IAccount) : null;
        } catch (error) {
            console.error(`${this.errorMsg}:`, error);
            return null;
        }
    };

    Helpers = {};
}

export const DB = new dbConnectorAccount();

export namespace helpers {
    export async function refreshLastSeenAt(userId: Model.IAccount['_id']): Promise<void> {
        const lastSeenAt = new Date().toISOString();
        const user = await DB.Find.byId(userId);
        if (!user) return;
        await DB.update(userId, { lastSeenAt });
    }

    export function generateVerificationCode(): string {
        return String(Helper.generateHumanReadableCode()).substring(0, 6);
    }

    export function secureOutput(user: Model.IAccount): Model.SecuredAccount {
        const securedAccount: Model.SecuredAccount = {
            _id: user._id,
            cookiesAgreement: user.cookiesAgreement,
            countryCode: user.countryCode,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            rodoAgreement: user.rodoAgreement,
            role: user.role,
            userInterfaceLanguage: user.userInterfaceLanguage,
        };

        return securedAccount;
    }

    export async function validateVerificationCode(user: Model.IAccount, code: string, userAgentData?: string): Promise<void> {
        // if (Helper.isTestModeEnabled()) {
        //     if (userAgentData) await DB.update(user._id, { latestUserAgentData: userAgentData });
        //     return;
        // }

        const now = new Date();

        if (!user.latestFailedLoginAt || isAfter(now, addMinutes(new Date(user.latestFailedLoginAt), ConstantsGlobal.App.ACCOUNT_BLOCK_DURATION_MINUTES))) user.failedLoginAttempts = 0;

        if (user.failedLoginAttempts >= ConstantsGlobal.App.FAILED_LOGIN_ATTEMPTS_LIMIT) {
            const failedLoginAttempts = user.failedLoginAttempts + 1;
            const accountBlockedUntil = addMinutes(now, ConstantsGlobal.App.ACCOUNT_BLOCK_DURATION_MINUTES).toISOString();
            await DB.update(user._id, { failedLoginAttempts, latestFailedLoginAt: now.toISOString(), ...(userAgentData && { latestUserAgentData: userAgentData }) });
            throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.ACCOUNT_TEMPORARILY_BLOCKED, { failedLoginAttempts, accountBlockedUntil });
        }

        const matchingCode = user?.verificationCodes?.find((c) => c.value === code);
        if (matchingCode && isBefore(now, addMinutes(new Date(matchingCode.createdAt), ConstantsGlobal.App.VERIFICATION_CODE_EXPIRED_MINUTES))) {
            await DB.update(user._id, { verificationCodes: [], failedLoginAttempts: 0, latestFailedLoginAt: null, ...(userAgentData && { latestUserAgentData: userAgentData }) });
            return;
        }

        await DB.update(user._id, { failedLoginAttempts: (user.failedLoginAttempts ?? 0) + 1, latestFailedLoginAt: now.toISOString(), ...(userAgentData && { latestUserAgentData: userAgentData }) });

        throw errorsAdapter.Global.createError(matchingCode ? errorsAdapter.Global.ErrorsEnum.VERIFICATION_CODE_EXPIRED : errorsAdapter.Global.ErrorsEnum.INCORRECT_VERIFICATION_CODE);
    }

    export async function deactivateUserAccount(userId: string): Promise<void> {
        const userUpdate: Model.IAccount = {
            cookiesAgreement: false,
            confirmed: false,
            email: '',
            firstName: '',
            isEnabled: false,
            lastName: '',
            latestUserAgentData: '',
            rodoAgreement: false,
            verificationCodes: [],
        };

        await DB.update(userId, userUpdate);
    }
}
