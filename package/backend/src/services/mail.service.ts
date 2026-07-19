import { createTransport, TransportOptions, SendMailOptions } from 'nodemailer';
import { accountService, templateService } from '.';
import { ConstantsEnv, ConstantsGlobal } from '../core/constants';

export class Email {
    protected to: string;
    protected firstName: string;
    protected from = `Senior Vigour <${ConstantsEnv.Email.EMAIL_FROM}>`;
    constructor(user: accountService.Model.IAccount) {
        this.to = user.email;
        this.firstName = user.firstName;
    }

    newTransport() {
        if (ConstantsEnv.Main.APP_MODE !== ConstantsEnv.APP_MODES.DEV) {
            return createTransport({
                host: ConstantsEnv.Email.BREVO_ADDRESS,
                port: ConstantsEnv.Email.BREVO_PORT,
                auth: {
                    user: ConstantsEnv.Email.BREVO_USERNAME,
                    pass: ConstantsEnv.Email.BREVO_PASSWORD,
                },
            } as TransportOptions);
        }
        return createTransport({
            host: ConstantsEnv.Email.EMAIL_HOST,
            port: ConstantsEnv.Email.EMAIL_PORT,
            auth: {
                user: ConstantsEnv.Email.EMAIL_USERNAME,
                pass: ConstantsEnv.Email.EMAIL_PASSWORD,
            },
        } as TransportOptions);
    }

    async send(html: string, subject: string, text?: string) {
        const options: SendMailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text,
        };
        await this.newTransport().sendMail(options);
    }

    async sendVerificationCode(verificationCode: string, locale: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES = ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.en, register: boolean = false) {
        const [template, text, subject] = register ? await templateService.Register.renderRegister(locale, verificationCode) : await templateService.Login.renderLogin(locale, verificationCode);
        await this.send(template, subject, text);
    }
}
