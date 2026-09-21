import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DB, helpers, Model } from '../../src/services/account.service';
import { ConstantsGlobal } from '../../src/core/constants';
import { ApiError } from '../../src/core/errorAdapter';

describe('account.service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('DB.findByEmail', () => {
        it('should return null if email is empty or missing', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = await DB.findByEmail('');
            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
        });

        it('should return account when found in database', async () => {
            const mockAccount = { _id: '123', email: 'test@example.com' } as Model.IAccount;
            vi.spyOn(Model.Account, 'find').mockReturnValue({
                limit: () => ({
                    lean: () => ({
                        exec: async () => [mockAccount],
                    }),
                }),
            } as unknown as ReturnType<typeof Model.Account.find>);

            const result = await DB.findByEmail('test@example.com');
            expect(result).toEqual(mockAccount);
        });

        it('should return null if account is not found in database', async () => {
            vi.spyOn(Model.Account, 'find').mockReturnValue({
                limit: () => ({
                    lean: () => ({
                        exec: async () => [],
                    }),
                }),
            } as unknown as ReturnType<typeof Model.Account.find>);

            const result = await DB.findByEmail('nonexistent@example.com');
            expect(result).toBeNull();
        });

        it('should catch database errors and return null', async () => {
            vi.spyOn(Model.Account, 'find').mockReturnValue({
                limit: () => ({
                    lean: () => ({
                        exec: async () => {
                            throw new Error('DB Connection error');
                        },
                    }),
                }),
            } as unknown as ReturnType<typeof Model.Account.find>);

            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const result = await DB.findByEmail('error@example.com');
            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('helpers.refreshLastSeenAt', () => {
        it('should update lastSeenAt when user is found', async () => {
            const mockUser = { _id: 'user123', email: 'user@example.com' } as Model.IAccount;
            vi.spyOn(DB.Find, 'byId').mockResolvedValue(mockUser);
            const updateSpy = vi.spyOn(DB, 'update').mockResolvedValue(mockUser);

            await helpers.refreshLastSeenAt('user123');

            expect(DB.Find.byId).toHaveBeenCalledWith('user123');
            expect(updateSpy).toHaveBeenCalledWith('user123', expect.objectContaining({
                lastSeenAt: expect.any(String),
            }));
        });

        it('should do nothing if user is not found', async () => {
            vi.spyOn(DB.Find, 'byId').mockResolvedValue(null);
            const updateSpy = vi.spyOn(DB, 'update').mockResolvedValue(null);

            await helpers.refreshLastSeenAt('nonexistent');

            expect(DB.Find.byId).toHaveBeenCalledWith('nonexistent');
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe('helpers.generateVerificationCode', () => {
        it('should generate a 6-character verification code', () => {
            const code = helpers.generateVerificationCode();
            expect(typeof code).toBe('string');
            expect(code.length).toBe(6);
        });
    });

    describe('helpers.secureOutput', () => {
        it('should return secured account fields and strip sensitive data', () => {
            const fullUser: Model.IAccount = {
                _id: 'user123',
                cookiesAgreement: true,
                countryCode: 'PL',
                email: 'test@example.com',
                firstName: 'Jan',
                lastName: 'Kowalski',
                rodoAgreement: true,
                role: ConstantsGlobal.Account.ROLES_ENUM.STUDENT,
                userInterfaceLanguage: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.pl,
                failedLoginAttempts: 2,
                latestFailedLoginAt: new Date().toISOString(),
                verificationCodes: [{ value: '123456', createdAt: new Date().toISOString() }],
            };

            const secured = helpers.secureOutput(fullUser);

            expect(secured).toEqual({
                _id: 'user123',
                cookiesAgreement: true,
                countryCode: 'PL',
                email: 'test@example.com',
                firstName: 'Jan',
                lastName: 'Kowalski',
                rodoAgreement: true,
                role: ConstantsGlobal.Account.ROLES_ENUM.STUDENT,
                userInterfaceLanguage: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.pl,
            });
            expect((secured as Record<string, unknown>).verificationCodes).toBeUndefined();
            expect((secured as Record<string, unknown>).failedLoginAttempts).toBeUndefined();
        });
    });

    describe('helpers.validateVerificationCode', () => {
        it('should validate matching non-expired code and reset failed attempts', async () => {
            const validCode = '123456';
            const user: Model.IAccount = {
                _id: 'user123',
                failedLoginAttempts: 1,
                verificationCodes: [{ value: validCode, createdAt: new Date().toISOString() }],
            };
            const updateSpy = vi.spyOn(DB, 'update').mockResolvedValue(null);

            await expect(helpers.validateVerificationCode(user, validCode)).resolves.toBeUndefined();

            expect(updateSpy).toHaveBeenCalledWith('user123', expect.objectContaining({
                verificationCodes: [],
                failedLoginAttempts: 0,
                latestFailedLoginAt: null,
            }));
        });

        it('should throw INCORRECT_VERIFICATION_CODE and increment failedLoginAttempts when code does not match', async () => {
            const user: Model.IAccount = {
                _id: 'user123',
                failedLoginAttempts: 0,
                verificationCodes: [{ value: '123456', createdAt: new Date().toISOString() }],
            };
            const updateSpy = vi.spyOn(DB, 'update').mockResolvedValue(null);

            await expect(helpers.validateVerificationCode(user, '654321')).rejects.toThrow();

            expect(updateSpy).toHaveBeenCalledWith('user123', expect.objectContaining({
                failedLoginAttempts: 1,
                latestFailedLoginAt: expect.any(String),
            }));
        });

        it('should throw VERIFICATION_CODE_EXPIRED when code is expired', async () => {
            const expiredDate = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 mins ago (limit is 15)
            const user: Model.IAccount = {
                _id: 'user123',
                failedLoginAttempts: 0,
                verificationCodes: [{ value: '123456', createdAt: expiredDate }],
            };
            const updateSpy = vi.spyOn(DB, 'update').mockResolvedValue(null);

            await expect(helpers.validateVerificationCode(user, '123456')).rejects.toThrow();

            expect(updateSpy).toHaveBeenCalledWith('user123', expect.objectContaining({
                failedLoginAttempts: 1,
            }));
        });

        it('should throw ACCOUNT_TEMPORARILY_BLOCKED when failed login limit is reached', async () => {
            const user: Model.IAccount = {
                _id: 'user123',
                failedLoginAttempts: ConstantsGlobal.App.FAILED_LOGIN_ATTEMPTS_LIMIT,
                latestFailedLoginAt: new Date().toISOString(),
                verificationCodes: [{ value: '123456', createdAt: new Date().toISOString() }],
            };
            const updateSpy = vi.spyOn(DB, 'update').mockResolvedValue(null);

            await expect(helpers.validateVerificationCode(user, '123456')).rejects.toSatisfy((err: ApiError) => {
                return err.httpCode === 401 && err.message === 'Account temporarily blocked.';
            });

            expect(updateSpy).toHaveBeenCalledWith('user123', expect.objectContaining({
                failedLoginAttempts: ConstantsGlobal.App.FAILED_LOGIN_ATTEMPTS_LIMIT + 1,
                latestFailedLoginAt: expect.any(String),
            }));
        });

        it('should reset failed login count if previous block duration has expired', async () => {
            const oldFailedLoginAt = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago
            const user: Model.IAccount = {
                _id: 'user123',
                failedLoginAttempts: ConstantsGlobal.App.FAILED_LOGIN_ATTEMPTS_LIMIT,
                latestFailedLoginAt: oldFailedLoginAt,
                verificationCodes: [{ value: '123456', createdAt: new Date().toISOString() }],
            };
            const updateSpy = vi.spyOn(DB, 'update').mockResolvedValue(null);

            await expect(helpers.validateVerificationCode(user, '123456')).resolves.toBeUndefined();

            expect(updateSpy).toHaveBeenCalledWith('user123', expect.objectContaining({
                failedLoginAttempts: 0,
                verificationCodes: [],
            }));
        });
    });

    describe('helpers.deactivateUserAccount', () => {
        it('should call DB.update with deactivated user payload', async () => {
            const updateSpy = vi.spyOn(DB, 'update').mockResolvedValue(null);

            await helpers.deactivateUserAccount('user123');

            expect(updateSpy).toHaveBeenCalledWith('user123', {
                cookiesAgreement: false,
                confirmed: false,
                email: '',
                firstName: '',
                isEnabled: false,
                lastName: '',
                latestUserAgentData: '',
                rodoAgreement: false,
                verificationCodes: [],
            });
        });
    });
});
