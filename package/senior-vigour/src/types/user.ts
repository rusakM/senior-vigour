export const UserRole = {
    STUDENT: "STUDENT",
    USER: "TEACHER",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface IUser {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
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
    role?: UserRole;
    countryCode?: string;
}
