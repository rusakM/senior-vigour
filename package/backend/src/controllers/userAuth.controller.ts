import * as ct from 'countries-and-timezones';
import { Request, Response, Router } from 'express';
import { Helper } from '../shared/defs';
import { appResponse, appRoute } from '../shared/route';
import { security } from '../shared/security';

import * as accountValidation from '../middlewares/validators/userAuth';

import { accountService, mailService } from '../services';

import { ConstantsGlobal } from '../core/constants';
import * as errorsAdapter from '../core/errorAdapter';
import { IAccount } from '../models/Account';

async function register(req: Request, res: Response) {
    let user = await accountService.DB.findByEmail(req.body?.email?.toLowerCase());
    if (user && user.confirmed) throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.USER_EMAIL_EXIST, { email: req.body.email });

    const verificationCode = accountService.helpers.generateVerificationCode();

    if (!user) {
        const userData = req.body;

        const newUser: accountService.Model.IAccount = {
            ...userData,
            lastSeenAt: new Date().toISOString(),
            latestUserAgentData: req.headers['user-agent'],
            email: userData.email.toLowerCase(),
            verificationCodes: [{ createdAt: new Date().toISOString(), value: verificationCode }],
        };

        user = await accountService.DB.create(newUser);
    } else {
        user = await accountService.DB.update(user._id, { verificationCodes: [{ createdAt: new Date().toISOString(), value: verificationCode }, ...(user?.verificationCodes || [])].slice(0, ConstantsGlobal.App.VERIFICATION_CODES_ARRAY_LENGTH) });
    }

    new mailService.Email(user).sendVerificationCode(verificationCode, user?.userInterfaceLanguage);

    const responseBody = {
        message: 'Verification required',
        ...(Helper.isTestModeEnabled() && { verificationCode }),
    };
    return appResponse.prepareJsonResponse(res, responseBody);
}

async function login(req: Request, res: Response) {
    const [emailToLowerCase, testPlanetGoals] = req.body.email.toLowerCase().split(ConstantsGlobal.App.TEST_MAIL_DOMAIN);
    const user = await accountService.DB.findByEmail(emailToLowerCase);
    if (!user) throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.USER_WITH_EMAIL_NOT_FOUND, { email: req.body.email });

    const verificationCode = accountService.helpers.generateVerificationCode();

    //if (testPlanetGoals === undefined)
    // mailService.SendTo.Client.Account.login({
    //     account: user,
    //     verificationCode,
    //     appUrlRedirect: `${req.headers.origin}/confirm`,
    // });

    // await sendEmail(req.body.email, 'Account verification', verificationCode);
    new mailService.Email(user).sendVerificationCode(verificationCode, user.userInterfaceLanguage, false);
    const userAccountUpdate: IAccount = {
        verificationCodes: [{ createdAt: new Date().toISOString(), value: verificationCode }, ...(user?.verificationCodes || [])].slice(0, ConstantsGlobal.App.VERIFICATION_CODES_ARRAY_LENGTH),
    };

    await accountService.DB.update(user._id, userAccountUpdate);
    const response: any = {
        message: 'Verification required',
    };
    if (Helper.isTestModeEnabled()) {
        response['verificationCode'] = verificationCode;
    }
    return appResponse.prepareJsonResponse(res, response);
}

async function confirm(req: Request, res: Response) {
    const emailToLowerCase = req.body.email.toLowerCase().split(ConstantsGlobal.App.TEST_MAIL_DOMAIN)[0];
    let user: accountService.Model.IAccount = await accountService.DB.findByEmail(emailToLowerCase);
    if (!user) throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.USER_WITH_EMAIL_NOT_FOUND, { email: emailToLowerCase });

    const userAgentData = req.headers['user-agent'];
    await accountService.helpers.validateVerificationCode(user, req.body.verificationCode, userAgentData);

    if (!user.confirmed) {
        user = await accountService.DB.update(user._id, { confirmed: true });
    }

    const token = security.generateSpecificToken({ id: user._id, role: user.role }, '7d');
    return appResponse.prepareJsonResponse(res, { token, user: accountService.helpers.secureOutput(user) });
}

function refreshToken(req: Request, res: Response) {
    const userId = req.params.userId?.toString();
    const role = req.params.role?.toString();
    if (userId && role) {
        const token = security.generateSpecificToken({ id: userId, role }, '7d');
        return appResponse.prepareJsonResponse(res, { token });
    }
    throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.INCORRECT_TOKEN_PAYLOAD);
}

async function getCurrentUser(req: Request, res: Response) {
    if (!req.params.userId) throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.INCORRECT_TOKEN_PAYLOAD);

    const user = await accountService.DB.Find.byId(req.params.userId?.toString());
    if (!user) throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.USER_NOT_FOUND, { userId: req.params.userId });

    return appResponse.prepareJsonResponse(res, accountService.helpers.secureOutput(user));
}

async function updateAccount(req: Request, res: Response) {
    let user = await accountService.DB.Find.byId(req.params.userId?.toString());
    if (!user) throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.USER_NOT_FOUND, { userId: req.params.userId });

    if (req.body?.email && user.email !== req.body.email) throw errorsAdapter.Global.createError(errorsAdapter.Global.ErrorsEnum.USER_WITH_EMAIL_NOT_FOUND, { email: req.body.email });

    const userUpdate: accountService.Model.IAccount = {
        ...req.body,
    };

    user = await accountService.DB.update(user._id, userUpdate);
    if (req.body.isEnabled === false) process.nextTick(() => accountService.helpers.deactivateUserAccount(user._id));
    return appResponse.prepareJsonResponse(res, accountService.helpers.secureOutput(user));
}

export default function setup(router: Router) {
    router.post(appRoute.getMap().user.auth.login, accountValidation.validateLogin, login);
    router.post(appRoute.getMap().user.auth.register, accountValidation.validateRegister, register);
    router.post(appRoute.getMap().user.auth.confirm, accountValidation.validateConfirmation, confirm);
    router.post(appRoute.getMap().user.auth.refresh, security.validateRefreshRequest, refreshToken);
    router.patch(appRoute.getMap().user.auth.edit, security.validateAuthenticatedRequest, accountValidation.editAccount, updateAccount);
    router.get(appRoute.getMap().user.auth.me, security.validateAuthenticatedRequest, getCurrentUser);
}
