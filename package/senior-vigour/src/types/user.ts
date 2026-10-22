export const UserRoleEnum = {
    SENIOR: 'SENIOR',
    MENTOR: 'MENTOR',
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
    isEnabled?: boolean;
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
}

export interface IUserEditPayload {
    firstName?: string;
    lastName?: string;
    countryCode?: string;
    role?: UserRole;
    confirmed?: boolean;
    isEnabled?: boolean;
    userInterfaceLanguage?: string;
    cookiesAgreement?: boolean;
    rodoAgreement?: boolean;
}


