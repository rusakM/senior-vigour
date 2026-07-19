import { fileService } from '.';
import { ConstantsGlobal, ConstantsEnv } from '../core/constants';

interface IEmailTranslation {
    assignation: string;
    bye: string;
    code: string;
    copyright: string;
    hint: string;
    intro: string;
    notice: string;
    subject: string;
    validity: string;
    welcome: string;
}

interface ITranslation {
    email: {
        login: IEmailTranslation;
        registration: IEmailTranslation;
    };
}

export async function getTranslation(language: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES): Promise<ITranslation> {
    try {
        const translation = await fileService.read(`${ConstantsEnv.Tolgee.TOLGEE_CATALOG}/${language}.json`);
        if (translation) return JSON.parse(translation) as ITranslation;
        return null;
    } catch {
        return null;
    }
}

export function removeEmojisFromTranslation(text: string): string {
    return text
        .replace(/\\u[\dA-F]{4}/gi, (match) => String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16)))
        .replace(/\p{Extended_Pictographic}/gu, '')
        .trim();
}

export const translationHelper = (v: string, def: string) => (typeof v !== 'undefined' && v !== null ? v : def);
