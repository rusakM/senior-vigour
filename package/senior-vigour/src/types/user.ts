export const UserRoleEnum = {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
} as const;

export type UserRoleEnum = typeof UserRoleEnum[keyof typeof UserRoleEnum];
export type UserRole = UserRoleEnum;

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
