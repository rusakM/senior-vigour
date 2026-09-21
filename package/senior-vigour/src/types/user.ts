export enum UserRoleEnum {
    STUDENT = 'STUDENT',
    TEACHER = 'TEACHER',
}

export interface IUser {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: UserRoleEnum;
    confirmed?: boolean;
    userInterfaceLanguage?: string;
    countryCode?: string;
    cookiesAgreement?: boolean;
    rodoAgreement?: boolean;
}

export interface IUserLogin {
    email: string;
    verificationCode: string;
}

export interface IUserRegistration {
    email: string;
    firstName?: string;
    lastName?: string;
    role?: UserRoleEnum;
    countryCode?: string;
}
