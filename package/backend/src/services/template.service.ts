import ejs from 'ejs';
import path from 'node:path';
import { translationsService } from '.';
import { ConstantsGlobal } from '../core/constants';

type TRenderedTemplate = [html: string, text: string, subject: string];
const baseLocation = `${process.cwd()}/src/views`;

async function renderTemplate(templateName: string, props?: unknown): Promise<string> {
    try {
        const fileLocation = path.join(baseLocation, `${templateName}.ejs`);
        return await ejs.renderFile(fileLocation, props);
    } catch (error) {
        console.log(error);
        return '';
    }
}

export namespace Register {
    export async function renderRegister(locale: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES, verificationCode: string): Promise<TRenderedTemplate> {
        const translation = await translationsService.getTranslation(locale ?? ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en);
        const translationWoEmojis = translation?.email?.registration ? Object.fromEntries(Object.entries(translation.email.registration).map(([key, val]) => [key, translationsService.removeEmojisFromTranslation(val)])) : null;

        return [...((await Promise.all([renderTemplate('emails/register/html', { verificationCode, t: { ...(translationWoEmojis ? { ...translation.email.registration } : {}) } }), renderTemplate('emails/register/text', { verificationCode, t: { ...(translationWoEmojis ?? {}) } })])) || [verificationCode, verificationCode]), translationWoEmojis?.subject ?? 'PlanetGoals - account registration'];
    }
}

export namespace Login {
    export async function renderLogin(locale: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES, verificationCode: string): Promise<TRenderedTemplate> {
        const translation = await translationsService.getTranslation(locale ?? ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en);
        const translationWoEmojis = translation?.email?.login ? Object.fromEntries(Object.entries(translation.email.login).map(([key, val]) => [key, translationsService.removeEmojisFromTranslation(val)])) : null;
        return [...((await Promise.all([renderTemplate('emails/login/html', { verificationCode, t: { ...(translationWoEmojis ? { ...translation.email.login } : {}) } }), renderTemplate('emails/login/text', { verificationCode, t: { ...(translationWoEmojis ?? {}) } })])) || [verificationCode, verificationCode]), translationWoEmojis?.subject ?? 'Your PlanetGoals login code'];
    }
}
