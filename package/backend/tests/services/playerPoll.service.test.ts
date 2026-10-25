import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DB, Helpers, checkAnswer, Model } from '../../src/services/playerPoll.service';
import { accountService, questionService } from '../../src/services';
import { ConstantsCourse, ConstantsGlobal } from '../../src/core/constants';
import { ApiError } from '../../src/core/errorAdapter';

describe('playerPoll.service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('checkAnswer function', () => {
        it('should validate SINGLE_CHOOSE answers accurately', () => {
            const question: questionService.Model.IQuestion = {
                questionNumber: 1,
                question: 'q1',
                category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                type: ConstantsCourse.Question.TYPES_ENUM.SINGLE_CHOOSE,
                correctAnswer: '2',
            };

            expect(checkAnswer(question, '2')).toBe(true);
            expect(checkAnswer(question, '1')).toBe(false);
            expect(checkAnswer(question, '')).toBe(false);
        });

        it('should validate TRUE_FALSE answers accurately', () => {
            const question: questionService.Model.IQuestion = {
                questionNumber: 2,
                question: 'q2',
                category: ConstantsCourse.Module.CATEGORY.PHYSICAL_HEALTH,
                type: ConstantsCourse.Question.TYPES_ENUM.TRUE_FALSE,
                correctAnswer: 'true',
            };

            expect(checkAnswer(question, 'true')).toBe(true);
            expect(checkAnswer(question, 'false')).toBe(false);
        });

        it('should validate MULTI_CHOOSE answers regardless of order', () => {
            const question: questionService.Model.IQuestion = {
                questionNumber: 3,
                question: 'q3',
                category: ConstantsCourse.Module.CATEGORY.NUTRITION,
                type: ConstantsCourse.Question.TYPES_ENUM.MULTI_CHOOSE,
                correctAnswer: '[0,2]',
            };

            expect(checkAnswer(question, '[0,2]')).toBe(true);
            expect(checkAnswer(question, '[2,0]')).toBe(true);
            expect(checkAnswer(question, '[0]')).toBe(false);
            expect(checkAnswer(question, '[0,1,2]')).toBe(false);
            expect(checkAnswer(question, '[0,1]')).toBe(false);
            expect(checkAnswer(question, '[]')).toBe(false);
            expect(checkAnswer(question, 'invalid-json')).toBe(false);
        });

        it('should validate IMG_CHOOSE answers accurately', () => {
            const question: questionService.Model.IQuestion = {
                questionNumber: 4,
                question: 'q4',
                category: ConstantsCourse.Module.CATEGORY.ECOLOGY,
                type: ConstantsCourse.Question.TYPES_ENUM.IMG_CHOOSE,
                correctAnswer: '1',
            };

            expect(checkAnswer(question, '1')).toBe(true);
            expect(checkAnswer(question, '0')).toBe(false);
        });

        it('should validate SELECT_CORRECT_ORDER answers requiring exact sequence of at least 2 items', () => {
            const question: questionService.Model.IQuestion = {
                questionNumber: 5,
                question: 'q5',
                category: ConstantsCourse.Module.CATEGORY.DIGITAL_TECHNOLOGIES,
                type: ConstantsCourse.Question.TYPES_ENUM.SELECT_CORRECT_ORDER,
                correctAnswer: '[0,3,2,1,4,5]',
            };

            expect(checkAnswer(question, '[0,3,2,1,4,5]')).toBe(true);
            expect(checkAnswer(question, '[0, 3, 2, 1, 4, 5]')).toBe(true);
            expect(checkAnswer(question, '[0,2,3,1,4,5]')).toBe(false);
            expect(checkAnswer(question, '[0,3,2]')).toBe(false);
            expect(checkAnswer(question, '[0]')).toBe(false);
            expect(checkAnswer(question, '[]')).toBe(false);
            expect(checkAnswer(question, 'invalid-json')).toBe(false);
        });
    });

    describe('Helpers.createPlayerPoll', () => {
        it('should create a PlayerPoll for SENIOR using firstName and lastName from Account and initialize all 6 categoryScores to 0', async () => {
            vi.spyOn(accountService.DB.Find, 'byId').mockResolvedValue({
                _id: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                role: ConstantsGlobal.Account.ROLES_ENUM.SENIOR,
            });

            const createSpy = vi.spyOn(DB, 'create').mockImplementation(async (payload) => ({
                _id: 'poll-1',
                ...payload,
            }));

            const result = await Helpers.createPlayerPoll({
                playerId: 'senior-1',
                role: ConstantsGlobal.Account.ROLES_ENUM.SENIOR,
            });

            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(result).toMatchObject({
                _id: 'poll-1',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                score: 0,
                answers: [],
            });
            expect(result?.mentorId).toBeUndefined();
            expect(result?.categoryScores).toHaveLength(6);
            expect(result?.categoryScores).toEqual(
                Object.values(ConstantsCourse.Module.CATEGORY).map((category) => ({
                    category,
                    points: 0,
                }))
            );
        });

        it('should create a PlayerPoll for MENTOR recording mentorId and senior firstName & lastName', async () => {
            const createSpy = vi.spyOn(DB, 'create').mockImplementation(async (payload) => ({
                _id: 'poll-mentor-1',
                ...payload,
            }));

            const result = await Helpers.createPlayerPoll({
                playerId: 'mentor-1',
                role: ConstantsGlobal.Account.ROLES_ENUM.MENTOR,
                firstName: 'Anna',
                lastName: 'Kowalska',
            });

            expect(createSpy).toHaveBeenCalledTimes(1);
            expect(result).toMatchObject({
                _id: 'poll-mentor-1',
                playerId: 'mentor-1',
                mentorId: 'mentor-1',
                firstName: 'Anna',
                lastName: 'Kowalska',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                score: 0,
                answers: [],
            });
            expect(result?.categoryScores).toHaveLength(6);
        });

        it('should throw SENIOR_DETAILS_REQUIRED ApiError when MENTOR starts poll without senior firstName or lastName', async () => {
            await expect(
                Helpers.createPlayerPoll({
                    playerId: 'mentor-1',
                    role: ConstantsGlobal.Account.ROLES_ENUM.MENTOR,
                    firstName: '',
                    lastName: 'Kowalska',
                })
            ).rejects.toThrowError(ApiError);
        });
    });

    describe('Helpers.processAnswer', () => {
        const mockQuestion1: questionService.Model.IQuestion = {
            _id: 'q-id-1',
            questionNumber: 1,
            question: 'poll.q1',
            category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
            type: ConstantsCourse.Question.TYPES_ENUM.SINGLE_CHOOSE,
            correctAnswer: '1',
        };

        const mockQuestion2: questionService.Model.IQuestion = {
            _id: 'q-id-2',
            questionNumber: 2,
            question: 'poll.q2',
            category: ConstantsCourse.Module.CATEGORY.ECOLOGY,
            type: ConstantsCourse.Question.TYPES_ENUM.TRUE_FALSE,
            correctAnswer: 'true',
        };

        const initialCategoryScores = Object.values(ConstantsCourse.Module.CATEGORY).map(
            (category) => ({
                category,
                points: 0,
            })
        );

        it('should award 1 point for a correct answer, update categoryScores for that question category, and keep status STARTED when more questions remain', async () => {
            const existingPoll: Model.IPlayerPoll = {
                _id: 'poll-1',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                answers: [],
                categoryScores: initialCategoryScores,
                score: 0,
            };

            vi.spyOn(questionService.Helpers, 'getByQuestionNumber').mockResolvedValue(
                mockQuestion1
            );
            vi.spyOn(questionService.DB.Get, 'all').mockResolvedValue([
                mockQuestion1,
                mockQuestion2,
            ]);
            vi.spyOn(DB.Find, 'byId').mockResolvedValue(existingPoll);
            const updateSpy = vi.spyOn(DB, 'update').mockImplementation(async (_id, payload) => ({
                ...existingPoll,
                ...payload,
            }));

            const result = await Helpers.processAnswer({
                playerPollId: 'poll-1',
                playerId: 'senior-1',
                questionNumber: 1,
                response: '1',
                respondAt: '2026-10-20T18:00:00.000Z',
            });

            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(result?.score).toBe(1);
            expect(result?.status).toBe(ConstantsCourse.Game.STATUS_ENUM.STARTED);
            expect(result?.answers).toEqual([
                {
                    questionNumber: 1,
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    correctAnswer: '1',
                    points: 1,
                    response: '1',
                    respondAt: '2026-10-20T18:00:00.000Z',
                },
            ]);

            const mentalHealthScore = result?.categoryScores?.find(
                (cs) => cs.category === ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH
            );
            const ecologyScore = result?.categoryScores?.find(
                (cs) => cs.category === ConstantsCourse.Module.CATEGORY.ECOLOGY
            );
            expect(mentalHealthScore?.points).toBe(1);
            expect(ecologyScore?.points).toBe(0);
        });

        it('should award 0 points for an incorrect answer and mark status as FINISHED when all questions are answered', async () => {
            const existingPollWithOneAnswer: Model.IPlayerPoll = {
                _id: 'poll-1',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                answers: [
                    {
                        questionNumber: 1,
                        category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                        correctAnswer: '1',
                        points: 1,
                        response: '1',
                        respondAt: '2026-10-20T18:00:00.000Z',
                    },
                ],
                categoryScores: initialCategoryScores.map((cs) =>
                    cs.category === ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH
                        ? { ...cs, points: 1 }
                        : cs
                ),
                score: 1,
            };

            vi.spyOn(questionService.Helpers, 'getByQuestionNumber').mockResolvedValue(
                mockQuestion2
            );
            vi.spyOn(questionService.DB.Get, 'all').mockResolvedValue([
                mockQuestion1,
                mockQuestion2,
            ]);
            vi.spyOn(DB.Find, 'byId').mockResolvedValue(existingPollWithOneAnswer);
            vi.spyOn(DB, 'update').mockImplementation(async (_id, payload) => ({
                ...existingPollWithOneAnswer,
                ...payload,
            }));

            const result = await Helpers.processAnswer({
                playerPollId: 'poll-1',
                playerId: 'senior-1',
                questionNumber: 2,
                response: 'false',
                respondAt: '2026-10-20T18:01:00.000Z',
            });

            expect(result?.score).toBe(1);
            expect(result?.status).toBe(ConstantsCourse.Game.STATUS_ENUM.FINISHED);
            expect(result?.answers).toHaveLength(2);
            expect(result?.answers?.[1].points).toBe(0);
        });

        it('should overwrite previous answer for the same questionNumber and recalculate total and category scores accurately', async () => {
            const existingPoll: Model.IPlayerPoll = {
                _id: 'poll-1',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                answers: [
                    {
                        questionNumber: 1,
                        category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                        correctAnswer: '1',
                        points: 1,
                        response: '1',
                        respondAt: '2026-10-20T18:00:00.000Z',
                    },
                ],
                categoryScores: initialCategoryScores.map((cs) =>
                    cs.category === ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH
                        ? { ...cs, points: 1 }
                        : cs
                ),
                score: 1,
            };

            vi.spyOn(questionService.Helpers, 'getByQuestionNumber').mockResolvedValue(
                mockQuestion1
            );
            vi.spyOn(questionService.DB.Get, 'all').mockResolvedValue([
                mockQuestion1,
                mockQuestion2,
            ]);
            vi.spyOn(DB.Find, 'byId').mockResolvedValue(existingPoll);
            vi.spyOn(DB, 'update').mockImplementation(async (_id, payload) => ({
                ...existingPoll,
                ...payload,
            }));

            // Now user changes answer on question 1 to wrong answer '0'
            const result = await Helpers.processAnswer({
                playerPollId: 'poll-1',
                playerId: 'senior-1',
                questionNumber: 1,
                response: '0',
                respondAt: '2026-10-20T18:02:00.000Z',
            });

            expect(result?.answers).toHaveLength(1);
            expect(result?.score).toBe(0);
            const mentalHealthScore = result?.categoryScores?.find(
                (cs) => cs.category === ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH
            );
            expect(mentalHealthScore?.points).toBe(0);
        });

        it('should throw QUESTION_NOT_FOUND when question does not exist', async () => {
            vi.spyOn(questionService.Helpers, 'getByQuestionNumber').mockResolvedValue(null);

            await expect(
                Helpers.processAnswer({
                    playerPollId: 'poll-1',
                    playerId: 'senior-1',
                    questionNumber: 999,
                    response: '1',
                    respondAt: '2026-10-20T18:00:00.000Z',
                })
            ).rejects.toThrowError(ApiError);
        });

        it('should throw PLAYER_POLL_NOT_FOUND when playerPoll does not exist', async () => {
            vi.spyOn(questionService.Helpers, 'getByQuestionNumber').mockResolvedValue(
                mockQuestion1
            );
            vi.spyOn(DB.Find, 'byId').mockResolvedValue(null);

            await expect(
                Helpers.processAnswer({
                    playerPollId: 'non-existent-poll',
                    playerId: 'senior-1',
                    questionNumber: 1,
                    response: '1',
                    respondAt: '2026-10-20T18:00:00.000Z',
                })
            ).rejects.toThrowError(ApiError);
        });

        it('should throw PLAYER_POLL_NOT_FOUND when user is not owner or mentor of the poll', async () => {
            const existingPoll: Model.IPlayerPoll = {
                _id: 'poll-1',
                playerId: 'senior-1',
                firstName: 'Jan',
                lastName: 'Nowak',
                status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
                answers: [],
                categoryScores: initialCategoryScores,
                score: 0,
            };

            vi.spyOn(questionService.Helpers, 'getByQuestionNumber').mockResolvedValue(
                mockQuestion1
            );
            vi.spyOn(DB.Find, 'byId').mockResolvedValue(existingPoll as any);

            await expect(
                Helpers.processAnswer({
                    playerPollId: 'poll-1',
                    playerId: 'other-user-999',
                    questionNumber: 1,
                    response: '1',
                    respondAt: '2026-10-20T18:00:00.000Z',
                })
            ).rejects.toThrowError(ApiError);
        });
    });
});
