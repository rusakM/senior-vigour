import { describe, it, expect } from 'vitest';
import { isValidEmail, mapUserApiError, type TranslateFn } from '../src/helpers/user.helper';

describe('user.helper unit tests', () => {
    describe('isValidEmail', () => {
        it('validates standard email addresses correctly', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name+tag@sub.domain.org')).toBe(true);
            expect(isValidEmail('   valid@mail.pl   ')).toBe(true);
        });

        it('rejects invalid email formats', () => {
            expect(isValidEmail('')).toBe(false);
            expect(isValidEmail('   ')).toBe(false);
            expect(isValidEmail('notanemail')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
            expect(isValidEmail('user@domain')).toBe(false);
            expect(isValidEmail('user@.com')).toBe(false);
            expect(isValidEmail('user space@domain.com')).toBe(false);
        });
    });

    describe('mapUserApiError', () => {
        const mockTranslate: TranslateFn = (_key: string, defaultValue?: string) => defaultValue || _key;

        it('returns null for null, undefined, or empty string', () => {
            expect(mapUserApiError(null, mockTranslate)).toBeNull();
            expect(mapUserApiError(undefined, mockTranslate)).toBeNull();
            expect(mapUserApiError('', mockTranslate)).toBeNull();
            expect(mapUserApiError('   ', mockTranslate)).toBeNull();
        });

        it('maps VALIDATION_ERROR according to context', () => {
            expect(mapUserApiError('VALIDATION_ERROR', mockTranslate, 'email')).toBe(
                'Please enter a valid email address (e.g. name@domain.com).'
            );
            expect(mapUserApiError('VALIDATION_ERROR', mockTranslate, 'code')).toBe(
                'Invalid verification code or account does not exist.'
            );
            expect(mapUserApiError('VALIDATION_ERROR', mockTranslate, 'general')).toBe(
                'Please check the entered data and try again.'
            );
        });

        it('maps standard API error codes to user-friendly messages', () => {
            expect(mapUserApiError('USER_EMAIL_EXIST', mockTranslate)).toBe(
                'An account with this email address already exists. Try logging in.'
            );
            expect(mapUserApiError('USER_WITH_EMAIL_NOT_FOUND', mockTranslate)).toBe(
                'No account found with this email address.'
            );
            expect(mapUserApiError('USER_NOT_FOUND', mockTranslate)).toBe(
                'No account found with this email address.'
            );
            expect(mapUserApiError('INCORRECT_VERIFICATION_CODE', mockTranslate)).toBe(
                'Invalid verification code or account does not exist.'
            );
            expect(mapUserApiError('VERIFICATION_CODE_EXPIRED', mockTranslate)).toBe(
                'The verification code has expired. Please request a new code.'
            );
            expect(mapUserApiError('ACCOUNT_TEMPORARILY_BLOCKED', mockTranslate)).toBe(
                'Too many attempts. Please wait a moment and try again.'
            );
            expect(mapUserApiError('TOO_MANY_REQUESTS', mockTranslate)).toBe(
                'Too many attempts. Please wait a moment and try again.'
            );
            expect(mapUserApiError('UNAUTHORIZED', mockTranslate)).toBe(
                'Your session has expired. Please sign in again.'
            );
            expect(mapUserApiError('PATCH_ERROR', mockTranslate)).toBe(
                'An unexpected error occurred. Please try again later.'
            );
        });

        it('maps network errors correctly', () => {
            expect(mapUserApiError('Network Error occurred', mockTranslate)).toBe(
                'Connection problem. Please check your internet connection and try again.'
            );
            expect(mapUserApiError('Failed to fetch resource', mockTranslate)).toBe(
                'Connection problem. Please check your internet connection and try again.'
            );
            expect(mapUserApiError('Request failed with status code 500', mockTranslate)).toBe(
                'Connection problem. Please check your internet connection and try again.'
            );
            expect(mapUserApiError('Request failed with status code 429', mockTranslate)).toBe(
                'Too many attempts. Please wait a moment and try again.'
            );
            expect(mapUserApiError('Request failed with status code 401', mockTranslate)).toBe(
                'Your session has expired. Please sign in again.'
            );
        });

        it('converts unknown technical UPPER_SNAKE_CASE errors to unexpected error message', () => {
            expect(mapUserApiError('UNKNOWN_BACKEND_CODE', mockTranslate)).toBe(
                'An unexpected error occurred. Please try again later.'
            );
        });

        it('passes through regular human-readable error messages unchanged', () => {
            expect(mapUserApiError('Custom human error message', mockTranslate)).toBe(
                'Custom human error message'
            );
        });
    });
});
