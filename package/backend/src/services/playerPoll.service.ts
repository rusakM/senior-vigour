import { dbConnector } from '../core';
import * as model from '../models/PlayerPoll';
export import Model = model;
import { accountService, questionService } from '.';
import { ConstantsCourse, ConstantsGlobal } from '../core/constants';
import * as ErrorsAdapter from '../core/errorAdapter';

class dbConnectorPlayerPoll extends dbConnector<
    Model.IDBPlayerPoll,
    Model.IPlayerPoll,
    Model.TIndexes
> {
    constructor() {
        super(Model.PlayerPoll);
    }
}

export const DB = new dbConnectorPlayerPoll();

const basicQuestionChecker = (answer: string, correctAnswer: string) =>
    answer === correctAnswer;

export const checkAnswersFunctions: {
    [key in ConstantsCourse.Question.TYPES_ENUM]: (
        answer: string,
        correctAnswer: string
    ) => boolean;
} = {
    [ConstantsCourse.Question.TYPES_ENUM.IMG_CHOOSE]: basicQuestionChecker,
    [ConstantsCourse.Question.TYPES_ENUM.MULTI_CHOOSE]: (
        answer: string,
        correctAnswer: string
    ) => {
        try {
            if (!answer || !correctAnswer) return false;
            const ansArr = JSON.parse(answer) as Array<number | string>;
            const corrAnsArr = JSON.parse(correctAnswer) as Array<number | string>;
            if (!Array.isArray(ansArr) || !Array.isArray(corrAnsArr)) return false;
            if (corrAnsArr.length !== ansArr.length || !ansArr.length) return false;
            for (let i = 0; i < ansArr.length; i++) {
                if (!corrAnsArr.includes(ansArr[i])) return false;
            }
            return true;
        } catch {
            return false;
        }
    },
    [ConstantsCourse.Question.TYPES_ENUM.SELECT_CORRECT_ORDER]: (
        answer: string,
        correctAnswer: string
    ) => {
        try {
            if (!answer || !correctAnswer) return false;
            const ansArr = JSON.parse(answer) as Array<number | string>;
            const corrAnsArr = JSON.parse(correctAnswer) as Array<number | string>;
            if (!Array.isArray(ansArr) || !Array.isArray(corrAnsArr)) return false;
            if (corrAnsArr.length !== ansArr.length || ansArr.length <= 1) return false;
            for (let i = 0; i < ansArr.length; i++) {
                if (ansArr[i] !== corrAnsArr[i]) return false;
            }
            return true;
        } catch {
            return false;
        }
    },
    [ConstantsCourse.Question.TYPES_ENUM.SINGLE_CHOOSE]: basicQuestionChecker,
    [ConstantsCourse.Question.TYPES_ENUM.TRUE_FALSE]: basicQuestionChecker,
};

export function checkAnswer(
    question: questionService.Model.IQuestion,
    answer?: string
): boolean {
    if (!question?.type) return false;
    if (question.correctAnswer === undefined || question.correctAnswer === null) {
        return false;
    }
    const checker = checkAnswersFunctions[question.type];
    if (!checker) return false;
    return checker(answer ?? '', question.correctAnswer);
}

export function calculateCategoryScores(
    answers: Model.IPlayerAnswer[]
): Model.ICategoryScore[] {
    return Object.values(ConstantsCourse.Module.CATEGORY).map((category) => {
        const points = answers
            .filter((ans) => ans.category === category)
            .reduce((sum, ans) => sum + (ans.points ?? 0), 0);

        return {
            category,
            points,
        };
    });
}

export namespace Helpers {
    export async function createPlayerPoll(
        dto: Model.StartPollDTO
    ): Promise<Model.IPlayerPoll | null> {
        const isMentor = dto.role === ConstantsGlobal.Account.ROLES_ENUM.MENTOR;
        let firstName = dto.firstName?.trim() ?? '';
        let lastName = dto.lastName?.trim() ?? '';

        if (isMentor) {
            if (!firstName || !lastName) {
                throw ErrorsAdapter.Poll.createError(
                    ErrorsAdapter.Poll.ErrorsEnum.SENIOR_DETAILS_REQUIRED
                );
            }
        } else {
            if (!firstName || !lastName) {
                const account = await accountService.DB.Find.byId(dto.playerId);
                if (!account) {
                    throw ErrorsAdapter.Global.createError(
                        ErrorsAdapter.Global.ErrorsEnum.USER_NOT_FOUND
                    );
                }
                firstName = firstName || account.firstName || '';
                lastName = lastName || account.lastName || '';
            }
        }

        const initialCategoryScores = calculateCategoryScores([]);

        return await DB.create({
            answers: [],
            categoryScores: initialCategoryScores,
            firstName,
            lastName,
            ...(isMentor ? { mentorId: dto.playerId } : {}),
            playerId: dto.playerId,
            score: 0,
            status: ConstantsCourse.Game.STATUS_ENUM.STARTED,
        });
    }

    export async function processAnswer(
        answerDTO: Model.ProcessAnswerDTO
    ): Promise<Model.IPlayerPoll | null> {
        const question = await questionService.Helpers.getByQuestionNumber(
            answerDTO.questionNumber
        );
        if (!question) {
            throw ErrorsAdapter.Poll.createError(
                ErrorsAdapter.Poll.ErrorsEnum.QUESTION_NOT_FOUND
            );
        }

        const playerPoll = await DB.Find.byId(answerDTO.playerPollId);
        if (!playerPoll) {
            throw ErrorsAdapter.Poll.createError(
                ErrorsAdapter.Poll.ErrorsEnum.PLAYER_POLL_NOT_FOUND
            );
        }

        if (playerPoll.status === ConstantsCourse.Game.STATUS_ENUM.FINISHED) {
            throw ErrorsAdapter.Poll.createError(
                ErrorsAdapter.Poll.ErrorsEnum.POLL_ALREADY_FINISHED
            );
        }

        const isCorrect = checkAnswer(question, answerDTO.response);
        const points = isCorrect ? 1 : 0;

        const answers = [...(playerPoll.answers ?? [])];
        const existingIndex = answers.findIndex(
            (ans) => ans.questionNumber === answerDTO.questionNumber
        );

        const answerEntry: Model.IPlayerAnswer = {
            category: question.category,
            correctAnswer: question.correctAnswer,
            points,
            questionNumber: answerDTO.questionNumber,
            respondAt: answerDTO.respondAt,
            response: answerDTO.response ?? '',
        };

        if (existingIndex >= 0) {
            answers[existingIndex] = answerEntry;
        } else {
            answers.push(answerEntry);
        }

        const categoryScores = calculateCategoryScores(answers);
        const score = answers.reduce((sum, ans) => sum + (ans.points ?? 0), 0);

        const allQuestions = (await questionService.DB.Get.all()) ?? [];
        const totalQuestionsCount = allQuestions.length;
        const isFinished =
            totalQuestionsCount > 0 && answers.length >= totalQuestionsCount;

        const status = isFinished
            ? ConstantsCourse.Game.STATUS_ENUM.FINISHED
            : ConstantsCourse.Game.STATUS_ENUM.STARTED;

        return await DB.update(playerPoll._id!, {
            ...playerPoll,
            answers,
            categoryScores,
            score,
            status,
        });
    }
}
