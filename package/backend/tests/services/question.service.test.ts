import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DB, Helpers, Model } from '../../src/services/question.service';
import { ConstantsCourse } from '../../src/core/constants';

describe('question.service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('Helpers.getAllSorted', () => {
        it('should return all questions sorted ascending by questionNumber', async () => {
            const unsortedQuestions: Model.IQuestion[] = [
                {
                    _id: 'q3',
                    questionNumber: 3,
                    question: 'poll.q3.title',
                    category: ConstantsCourse.Module.CATEGORY.ECOLOGY,
                    type: ConstantsCourse.Question.TYPES_ENUM.TRUE_FALSE,
                    correctAnswer: '0',
                },
                {
                    _id: 'q1',
                    questionNumber: 1,
                    question: 'poll.q1.title',
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    type: ConstantsCourse.Question.TYPES_ENUM.SINGLE_CHOOSE,
                    correctAnswer: '1',
                },
                {
                    _id: 'q2',
                    questionNumber: 2,
                    question: 'poll.q2.title',
                    category: ConstantsCourse.Module.CATEGORY.NUTRITION,
                    type: ConstantsCourse.Question.TYPES_ENUM.MULTI_CHOOSE,
                    correctAnswer: '[0,2]',
                },
            ];

            vi.spyOn(DB.Get, 'all').mockResolvedValue(unsortedQuestions);

            const result = await Helpers.getAllSorted();

            expect(result.map((q) => q.questionNumber)).toEqual([1, 2, 3]);
        });

        it('should return empty array when no questions exist', async () => {
            vi.spyOn(DB.Get, 'all').mockResolvedValue([]);

            const result = await Helpers.getAllSorted();

            expect(result).toEqual([]);
        });
    });

    describe('Helpers.getByQuestionNumber', () => {
        it('should return a question by its questionNumber', async () => {
            const mockQuestion: Model.IQuestion = {
                _id: 'q1',
                questionNumber: 1,
                question: 'poll.q1.title',
                category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                type: ConstantsCourse.Question.TYPES_ENUM.SINGLE_CHOOSE,
                correctAnswer: '1',
            };

            const byQuerySpy = vi.spyOn(DB.Find, 'byQuery').mockResolvedValue([mockQuestion]);

            const result = await Helpers.getByQuestionNumber(1);

            expect(byQuerySpy).toHaveBeenCalledWith({ questionNumber: 1 }, 1);
            expect(result).toEqual(mockQuestion);
        });

        it('should return null when questionNumber is not found', async () => {
            vi.spyOn(DB.Find, 'byQuery').mockResolvedValue([]);

            const result = await Helpers.getByQuestionNumber(99);

            expect(result).toBeNull();
        });
    });
});
