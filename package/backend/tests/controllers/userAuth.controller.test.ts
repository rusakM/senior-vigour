import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { register, login, confirm, refreshToken, getCurrentUser, updateAccount } from '../../src/controllers/userAuth.controller';
import { accountService, mailService } from '../../src/services';
import { ConstantsGlobal } from '../../src/core/constants';
import { ApiError } from '../../src/core/errorAdapter';

function createMockReqRes(reqOptions: Partial<Request> = {}) {
    const req = {
        body: {},
        params: {},
        headers: {},
        ...reqOptions,
    } as unknown as Request;

    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);

    return { req, res };
}

describe('userAuth.controller', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(mailService.Email.prototype, 'sendVerificationCode').mockImplementation(() => Promise.resolve() as any);
    });

    describe('register', () => {
        it('should throw USER_EMAIL_EXIST if user already exists and is confirmed', async () => {
            const { req, res } = createMockReqRes({
                body: { email: 'existing@example.com' },
            });

            vi.spyOn(accountService.DB, 'findByEmail').mockResolvedValue({
                _id: 'user123',
                email: 'existing@example.com',
                confirmed: true,
            } as any);

            await expect(register(req, res)).rejects.toSatisfy((err: ApiError) => {
                return err.httpCode === 403 && err.message === 'Email already exists.';
            });
        });

        it('should create new user when email does not exist and return 200', async () => {
            const { req, res } = createMockReqRes({
                body: { email: 'new@example.com', firstName: 'Jan' },
                headers: { 'user-agent': 'Vitest-Agent' },
            });

            vi.spyOn(accountService.DB, 'findByEmail').mockResolvedValue(null as any);
            vi.spyOn(accountService.helpers, 'generateVerificationCode').mockReturnValue('123456');
            const createSpy = vi.spyOn(accountService.DB, 'create').mockResolvedValue({
                _id: 'newuser1',
                email: 'new@example.com',
                confirmed: false,
            } as any);

            await register(req, res);

            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'new@example.com',
                    latestUserAgentData: 'Vitest-Agent',
                })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Verification required',
                })
            );
        });

        it('should update verification codes if user exists but is not confirmed', async () => {
            const { req, res } = createMockReqRes({
                body: { email: 'unconfirmed@example.com' },
                headers: {},
            });

            const unconfirmedUser = {
                _id: 'user123',
                email: 'unconfirmed@example.com',
                confirmed: false,
                verificationCodes: [],
            } as any;

            vi.spyOn(accountService.DB, 'findByEmail').mockResolvedValue(unconfirmedUser);
            vi.spyOn(accountService.helpers, 'generateVerificationCode').mockReturnValue('654321');
            const updateSpy = vi.spyOn(accountService.DB, 'update').mockResolvedValue(unconfirmedUser);

            await register(req, res);

            expect(updateSpy).toHaveBeenCalledWith(
                'user123',
                expect.objectContaining({
                    verificationCodes: expect.arrayContaining([expect.objectContaining({ value: '654321' })]),
                })
            );
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('login', () => {
        it('should throw USER_WITH_EMAIL_NOT_FOUND when email does not exist', async () => {
            const { req, res } = createMockReqRes({
                body: { email: 'notfound@example.com' },
            });

            vi.spyOn(accountService.DB, 'findByEmail').mockResolvedValue(null as any);

            await expect(login(req, res)).rejects.toSatisfy((err: ApiError) => {
                return err.httpCode === 404 && err.message === 'User with such email does not exist.';
            });
        });

        it('should generate verification code, update user and return 200 on login', async () => {
            const { req, res } = createMockReqRes({
                body: { email: 'user@example.com' },
            });

            const user = {
                _id: 'user123',
                email: 'user@example.com',
                userInterfaceLanguage: ConstantsGlobal.App.USER_INTERFACE_LANGUAGES.pl,
                verificationCodes: [],
            } as any;

            vi.spyOn(accountService.DB, 'findByEmail').mockResolvedValue(user);
            vi.spyOn(accountService.helpers, 'generateVerificationCode').mockReturnValue('999888');
            const updateSpy = vi.spyOn(accountService.DB, 'update').mockResolvedValue(user);

            await login(req, res);

            expect(updateSpy).toHaveBeenCalledWith(
                'user123',
                expect.objectContaining({
                    verificationCodes: expect.arrayContaining([expect.objectContaining({ value: '999888' })]),
                })
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Verification required' }));
        });
    });

    describe('confirm', () => {
        it('should throw USER_WITH_EMAIL_NOT_FOUND if user is not found', async () => {
            const { req, res } = createMockReqRes({
                body: { email: 'missing@example.com', verificationCode: '123456' },
            });

            vi.spyOn(accountService.DB, 'findByEmail').mockResolvedValue(null as any);

            await expect(confirm(req, res)).rejects.toSatisfy((err: ApiError) => {
                return err.httpCode === 404;
            });
        });

        it('should validate code, confirm account and return JWT token', async () => {
            const { req, res } = createMockReqRes({
                body: { email: 'user@example.com', verificationCode: '123456' },
                headers: { 'user-agent': 'Browser-Agent' },
            });

            const user = {
                _id: 'user123',
                email: 'user@example.com',
                confirmed: false,
                role: ConstantsGlobal.Account.ROLES_ENUM.STUDENT,
            } as any;

            vi.spyOn(accountService.DB, 'findByEmail').mockResolvedValue(user);
            vi.spyOn(accountService.helpers, 'validateVerificationCode').mockResolvedValue(undefined);
            vi.spyOn(accountService.DB, 'update').mockResolvedValue({ ...user, confirmed: true });

            await confirm(req, res);

            expect(accountService.helpers.validateVerificationCode).toHaveBeenCalledWith(user, '123456', 'Browser-Agent');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    token: expect.any(String),
                    user: expect.objectContaining({ _id: 'user123' }),
                })
            );
        });
    });

    describe('refreshToken', () => {
        it('should throw INCORRECT_TOKEN_PAYLOAD if params are missing', () => {
            const { req, res } = createMockReqRes({ params: {} });

            expect(() => refreshToken(req, res)).toThrow();
        });

        it('should return a new token when userId and role params are provided', () => {
            const { req, res } = createMockReqRes({
                params: { userId: 'user123', role: ConstantsGlobal.Account.ROLES_ENUM.STUDENT } as any,
            });

            refreshToken(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: expect.any(String),
            });
        });
    });

    describe('getCurrentUser', () => {
        it('should throw INCORRECT_TOKEN_PAYLOAD if userId param is missing', async () => {
            const { req, res } = createMockReqRes({ params: {} });

            await expect(getCurrentUser(req, res)).rejects.toSatisfy((err: ApiError) => {
                return err.httpCode === 400;
            });
        });

        it('should throw USER_NOT_FOUND if user is not in database', async () => {
            const { req, res } = createMockReqRes({
                params: { userId: 'nonexistent' } as any,
            });

            vi.spyOn(accountService.DB.Find, 'byId').mockResolvedValue(null);

            await expect(getCurrentUser(req, res)).rejects.toSatisfy((err: ApiError) => {
                return err.httpCode === 404 && err.message === 'User not found.';
            });
        });

        it('should return secured user when user is found', async () => {
            const { req, res } = createMockReqRes({
                params: { userId: 'user123' } as any,
            });

            const user = {
                _id: 'user123',
                email: 'user@example.com',
                firstName: 'Anna',
                lastName: 'Nowak',
                role: ConstantsGlobal.Account.ROLES_ENUM.TEACHER,
            } as any;

            vi.spyOn(accountService.DB.Find, 'byId').mockResolvedValue(user);

            await getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    _id: 'user123',
                    email: 'user@example.com',
                    firstName: 'Anna',
                })
            );
        });
    });

    describe('updateAccount', () => {
        it('should throw USER_NOT_FOUND if user does not exist', async () => {
            const { req, res } = createMockReqRes({
                params: { userId: 'user123' } as any,
                body: { firstName: 'Jan' },
            });

            vi.spyOn(accountService.DB.Find, 'byId').mockResolvedValue(null);

            await expect(updateAccount(req, res)).rejects.toSatisfy((err: ApiError) => {
                return err.httpCode === 404;
            });
        });

        it('should throw USER_WITH_EMAIL_NOT_FOUND if body email differs from user email', async () => {
            const { req, res } = createMockReqRes({
                params: { userId: 'user123' } as any,
                body: { email: 'different@example.com' },
            });

            const user = { _id: 'user123', email: 'original@example.com' } as any;
            vi.spyOn(accountService.DB.Find, 'byId').mockResolvedValue(user);

            await expect(updateAccount(req, res)).rejects.toSatisfy((err: ApiError) => {
                return err.httpCode === 404;
            });
        });

        it('should update user and return secured user on valid update', async () => {
            const { req, res } = createMockReqRes({
                params: { userId: 'user123' } as any,
                body: { firstName: 'Janusz', email: 'user@example.com' },
            });

            const user = { _id: 'user123', email: 'user@example.com', firstName: 'Jan' } as any;
            const updatedUser = { ...user, firstName: 'Janusz' };

            vi.spyOn(accountService.DB.Find, 'byId').mockResolvedValue(user);
            vi.spyOn(accountService.DB, 'update').mockResolvedValue(updatedUser);

            await updateAccount(req, res);

            expect(accountService.DB.update).toHaveBeenCalledWith('user123', {
                firstName: 'Janusz',
                email: 'user@example.com',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    firstName: 'Janusz',
                })
            );
        });
    });
});
