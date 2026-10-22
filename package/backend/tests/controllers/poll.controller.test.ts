import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction, Router } from 'express';
import {
    getQuestions,
    getQuestion,
    startPoll,
    getPlayerPolls,
    getPlayerPoll,
    sendAnswer,
    default as setupPoll,
} from '../../src/controllers/poll.controller';
import {
    validateGetQuestion,
    validateStartPoll,
    validateSendAnswer,
} from '../../src/middlewares/validators/poll';
import { playerPollService, questionService } from '../../src/services';
import { ConstantsCourse, ConstantsGlobal } from '../../src/core/constants';
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

describe('poll.controller', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('getQuestions', () => {
        it('should return all sorted questions', async () => {
            const mockQuestions = [
                {
                    _id: 'q1',
                    questionNumber: 1,
                    question: 'poll.q1',
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    type: ConstantsCourse.Question.TYPES_ENUM.SINGLE_CHOOSE,
                    correctAnswer: '0',
                },
            ];

            vi.spyOn(questionService.Helpers, 'getAllSorted').mockResolvedValue(
                mockQuestions
            );

            const { req, res } = createMockReqRes();
            await getQuestions(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockQuestions);
        });
    });

    describe('getQuestion', () => {
        it('should return a question by questionNumber', async () => {
            const mockQuestion = {
                _id: 'q1',
                questionNumber: 1,
                question: 'poll.q1',
                category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                type: ConstantsCourse.Question.TYPES_ENUM.SINGLE_CHOOSE,
                correctAnswer: '0',
            };

            vi.spyOn(
                questionService.Helpers,
                'getByQuestionNumber'
            ).mockResolvedValue(mockQuestion);

            const { req, res } = createMockReqRes({
                params: { questionNumber: '1' } as any,
            });
            await getQuestion(req, res);

            expect(
                questionService.Helpers.getByQuestionNumber
            ).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockQuestion);
        });

        it('should return 404 error response when question is not found', async () => {
            vi.spyOn(
                questionService.Helpers,
                'getByQuestionNumber'
            ).mockResolvedValue(null);

            const { req, res } = createMockReqRes({
                params: { questionNumber: '99' } as any,
            });
            await getQuestion(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'QUESTION_NOT_FOUND',
                    success: false,
                })
            );
        });
    });

    describe('startPoll', () => {
        it('should create and return a new PlayerPoll', async () => {
            const mockPoll: playerPollService.Model.IPlayerPoll = {
                _id: 'poll-1',
                playerId: 'mentor-1',
                mentorId: 'mentor-1',
                firstName: 'Anna',
                lastName: 'Kowalska',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                answers: [],
                categoryScores: [],
                score: 0,
            };

            const createPollSpy = vi
                .spyOn(playerPollService.Helpers, 'createPlayerPoll')
                .mockResolvedValue(mockPoll);

            const { req, res } = createMockReqRes({
                params: {
                    userId: 'mentor-1',
                    role: ConstantsGlobal.Account.ROLES_ENUM.MENTOR,
                } as any,
                body: {
                    firstName: 'Anna',
                    lastName: 'Kowalska',
                },
            });

            await startPoll(req, res);

            expect(createPollSpy).toHaveBeenCalledWith({
                playerId: 'mentor-1',
                role: ConstantsGlobal.Account.ROLES_ENUM.MENTOR,
                firstName: 'Anna',
                lastName: 'Kowalska',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPoll);
        });
    });

    describe('getPlayerPolls', () => {
        it('should query finished polls for a SENIOR user and sort descending by createdAt', async () => {
            const olderPoll = {
                _id: 'poll-1',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.FINISHED,
                score: 8,
                createdAt: '2026-10-20T10:00:00.000Z',
            };
            const newerPoll = {
                _id: 'poll-2',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.FINISHED,
                score: 10,
                createdAt: '2026-10-21T12:00:00.000Z',
            };

            const findSpy = vi
                .spyOn(playerPollService.DB.Find, 'byQuery')
                .mockResolvedValue([olderPoll, newerPoll] as any[]);

            const { req, res } = createMockReqRes({
                params: {
                    userId: 'senior-1',
                    role: ConstantsGlobal.Account.ROLES_ENUM.SENIOR,
                } as any,
            });

            await getPlayerPolls(req, res);

            expect(findSpy).toHaveBeenCalledWith({
                status: ConstantsCourse.Game.STATUS_ENUM.FINISHED,
                playerId: 'senior-1',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([newerPoll, olderPoll]);
        });

        it('should query finished polls for a MENTOR user with $or condition on mentorId and playerId', async () => {
            const mentorPolls = [
                {
                    _id: 'poll-3',
                    playerId: 'mentor-1',
                    mentorId: 'mentor-1',
                    firstName: 'Anna',
                    lastName: 'Kowalska',
                    status: ConstantsCourse.Game.STATUS_ENUM.FINISHED,
                    score: 9,
                    createdAt: '2026-10-22T09:00:00.000Z',
                },
            ] as any[];

            const findSpy = vi
                .spyOn(playerPollService.DB.Find, 'byQuery')
                .mockResolvedValue(mentorPolls);

            const { req, res } = createMockReqRes({
                params: {
                    userId: 'mentor-1',
                    role: ConstantsGlobal.Account.ROLES_ENUM.MENTOR,
                } as any,
            });

            await getPlayerPolls(req, res);

            expect(findSpy).toHaveBeenCalledWith({
                status: ConstantsCourse.Game.STATUS_ENUM.FINISHED,
                $or: [{ mentorId: 'mentor-1' }, { playerId: 'mentor-1' }],
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mentorPolls);
        });
    });

    describe('getPlayerPoll', () => {
        it('should return a PlayerPoll by playerPollId', async () => {
            const mockPoll = {
                _id: 'poll-1',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                score: 2,
            } as any;

            vi.spyOn(playerPollService.DB.Find, 'byId').mockResolvedValue(mockPoll);

            const { req, res } = createMockReqRes({
                params: { playerPollId: 'poll-1', userId: 'senior-1' } as any,
            });

            await getPlayerPoll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockPoll);
        });

        it('should return 404 when PlayerPoll is not found', async () => {
            vi.spyOn(playerPollService.DB.Find, 'byId').mockResolvedValue(null);

            const { req, res } = createMockReqRes({
                params: { playerPollId: 'poll-missing', userId: 'senior-1' } as any,
            });

            await getPlayerPoll(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'PLAYER_POLL_NOT_FOUND',
                    success: false,
                })
            );
        });
    });

    describe('sendAnswer', () => {
        it('should process an answer and return the updated PlayerPoll', async () => {
            const updatedPoll = {
                _id: 'poll-1',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                score: 1,
                answers: [
                    {
                        questionNumber: 1,
                        category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                        points: 1,
                        response: '2',
                    },
                ],
                categoryScores: [
                    {
                        category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                        points: 1,
                    },
                ],
            } as any;

            const processSpy = vi
                .spyOn(playerPollService.Helpers, 'processAnswer')
                .mockResolvedValue(updatedPoll);

            const { req, res } = createMockReqRes({
                params: {
                    playerPollId: 'poll-1',
                    userId: 'senior-1',
                    requestTime: '2026-10-20T19:00:00.000Z',
                } as any,
                body: {
                    questionNumber: 1,
                    response: '2',
                },
            });

            await sendAnswer(req, res);

            expect(processSpy).toHaveBeenCalledWith({
                playerPollId: 'poll-1',
                playerId: 'senior-1',
                questionNumber: 1,
                response: '2',
                respondAt: '2026-10-20T19:00:00.000Z',
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(updatedPoll);
        });
    });

    describe('poll validators', () => {
        it('validateGetQuestion should call next() for valid questionNumber >= 1', () => {
            const { req, res } = createMockReqRes({
                params: { questionNumber: '5' } as any,
            });
            const next = vi.fn() as NextFunction;

            validateGetQuestion(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('validateGetQuestion should throw ApiError for questionNumber < 1', () => {
            const { req, res } = createMockReqRes({
                params: { questionNumber: '0' } as any,
            });
            const next = vi.fn() as NextFunction;

            expect(() => validateGetQuestion(req, res, next)).toThrowError(ApiError);
            expect(next).not.toHaveBeenCalled();
        });

        it('validateStartPoll should require firstName and lastName for MENTOR role', () => {
            const { req, res } = createMockReqRes({
                params: { role: ConstantsGlobal.Account.ROLES_ENUM.MENTOR } as any,
                body: { firstName: 'Anna' },
            });
            const next = vi.fn() as NextFunction;

            expect(() => validateStartPoll(req, res, next)).toThrowError(ApiError);
            expect(next).not.toHaveBeenCalled();
        });

        it('validateStartPoll should allow empty body for SENIOR role', () => {
            const { req, res } = createMockReqRes({
                params: { role: ConstantsGlobal.Account.ROLES_ENUM.SENIOR } as any,
                body: {},
            });
            const next = vi.fn() as NextFunction;

            validateStartPoll(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('validateSendAnswer should validate questionNumber and response', () => {
            const { req, res } = createMockReqRes({
                body: { questionNumber: 1, response: '0' },
            });
            const next = vi.fn() as NextFunction;

            validateSendAnswer(req, res, next);
            expect(next).toHaveBeenCalled();
        });

        it('validateSendAnswer should throw ApiError when questionNumber is missing', () => {
            const { req, res } = createMockReqRes({
                body: { response: '0' },
            });
            const next = vi.fn() as NextFunction;

            expect(() => validateSendAnswer(req, res, next)).toThrowError(ApiError);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('setupPoll router', () => {
        it('should register GET and POST poll endpoints on router', () => {
            const router = {
                get: vi.fn(),
                post: vi.fn(),
            } as unknown as Router;

            setupPoll(router);

            expect(router.get).toHaveBeenCalledTimes(4);
            expect(router.post).toHaveBeenCalledTimes(2);
        });
    });
});
