import type { IUser } from '../types/user';

/**
 * Checks whether user has completed all necessary profile details (first name, last name, confirmed).
 * If not, the user should be directed to fill out registration details.
 */
export const isUserProfileComplete = (user: IUser | null | undefined): boolean => {
    if (!user) return false;
    return Boolean(
        user.firstName &&
        user.firstName.trim().length > 0 &&
        user.lastName &&
        user.lastName.trim().length > 0 &&
        user.confirmed
    );
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => {
    return EMAIL_REGEX.test(email.trim());
};

export type TranslateFn = (key: string, defaultValue?: string) => string;

export const mapUserApiError = (
    error: string | null | undefined,
    t: TranslateFn,
    context?: 'email' | 'code' | 'general'
): string | null => {
    if (!error) return null;
    const trimmed = error.trim();
    if (!trimmed) return null;

    switch (trimmed) {
        case 'VALIDATION_ERROR':
            if (context === 'email') {
                return t(
                    'validation.email.invalid',
                    'Please enter a valid email address (e.g. name@domain.com).'
                );
            }
            if (context === 'code') {
                return t(
                    'confirm.error.invalidCode',
                    'Invalid verification code or account does not exist.'
                );
            }
            return t(
                'errors.validationError',
                'Please check the entered data and try again.'
            );
        case 'USER_EMAIL_EXIST':
            return t(
                'errors.userEmailExist',
                'An account with this email address already exists. Try logging in.'
            );
        case 'USER_WITH_EMAIL_NOT_FOUND':
        case 'USER_NOT_FOUND':
            return t(
                'errors.userWithEmailNotFound',
                'No account found with this email address.'
            );
        case 'INCORRECT_VERIFICATION_CODE':
            return t(
                'confirm.error.invalidCode',
                'Invalid verification code or account does not exist.'
            );
        case 'VERIFICATION_CODE_EXPIRED':
            return t(
                'errors.verificationCodeExpired',
                'The verification code has expired. Please request a new code.'
            );
        case 'ACCOUNT_TEMPORARILY_BLOCKED':
        case 'TOO_MANY_REQUESTS':
            return t(
                'errors.accountTemporarilyBlocked',
                'Too many attempts. Please wait a moment and try again.'
            );
        case 'INCORRECT_TOKEN_PAYLOAD':
        case 'INVALID_TOKEN_PAYLOAD':
        case 'INSUFFICIENT_PERMISSIONS':
        case 'UNAUTHORIZED':
            return t(
                'errors.unauthorized',
                'Your session has expired. Please sign in again.'
            );
        case 'UNEXPECTED_ERROR':
        case 'PATCH_ERROR':
        case 'NOT_FOUND':
            return t(
                'errors.unexpected',
                'An unexpected error occurred. Please try again later.'
            );
        default:
            break;
    }

    const lower = trimmed.toLowerCase();
    if (
        lower.includes('network error') ||
        lower.includes('failed to fetch') ||
        lower.includes('timeout') ||
        lower.includes('econnaborted') ||
        lower.includes('status code 50')
    ) {
        return t(
            'errors.network',
            'Connection problem. Please check your internet connection and try again.'
        );
    }

    if (lower.includes('status code 429')) {
        return t(
            'errors.accountTemporarilyBlocked',
            'Too many attempts. Please wait a moment and try again.'
        );
    }

    if (lower.includes('status code 401') || lower.includes('status code 403')) {
        return t(
            'errors.unauthorized',
            'Your session has expired. Please sign in again.'
        );
    }

    // Never expose raw technical UPPER_SNAKE_CASE codes to the user
    if (/^[A-Z0-9_]+$/.test(trimmed)) {
        return t(
            'errors.unexpected',
            'An unexpected error occurred. Please try again later.'
        );
    }

    return trimmed;
};

