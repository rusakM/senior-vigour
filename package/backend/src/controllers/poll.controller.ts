import { Request, Response, Router } from 'express';
import { appResponse, appRoute } from '../shared/route';
import { security } from '../shared/security';
import * as ErrorsAdapter from '../core/errorAdapter';
import { playerPollService, questionService } from '../services';
import { ConstantsGlobal } from '../core/constants';
import {
    validateGetQuestion,
    validateStartPoll,
    validateSendAnswer,
} from '../middlewares/validators/poll';
import { useRequestTime } from '../middlewares/requestTime';

export async function getQuestions(req: Request, res: Response) {
    const questions = await questionService.Helpers.getAllSorted();
    return appResponse.prepareJsonResponse(res, questions);
}

export async function getQuestion(req: Request, res: Response) {
    const questionNumber = Number(req.params.questionNumber);
    const question = await questionService.Helpers.getByQuestionNumber(questionNumber);

    if (!question) {
        return appResponse.prepareErrorResponse(
            res,
            ErrorsAdapter.Poll.createError(ErrorsAdapter.Poll.ErrorsEnum.QUESTION_NOT_FOUND)
        );
    }

    return appResponse.prepareJsonResponse(res, question);
}

export async function startPoll(req: Request, res: Response) {
    const userId = req.params.userId?.toString();
    const role = req.params.role as ConstantsGlobal.Account.ROLES_ENUM;
    const { firstName, lastName } = req.body as { firstName?: string; lastName?: string };

    const playerPoll = await playerPollService.Helpers.createPlayerPoll({
        playerId: userId,
        role,
        firstName,
        lastName,
    });

    return appResponse.prepareJsonResponse(res, playerPoll);
}

export async function getPlayerPolls(req: Request, res: Response) {
    const userId = req.params.userId?.toString();
    const polls = (await playerPollService.DB.Find.byIndex('playerId', userId)) ?? [];
    return appResponse.prepareJsonResponse(res, polls);
}

export async function getPlayerPoll(req: Request, res: Response) {
    const playerPollId = req.params.playerPollId?.toString();
    const playerPoll = await playerPollService.DB.Find.byId(playerPollId);

    if (!playerPoll) {
        return appResponse.prepareErrorResponse(
            res,
            ErrorsAdapter.Poll.createError(ErrorsAdapter.Poll.ErrorsEnum.PLAYER_POLL_NOT_FOUND)
        );
    }

    return appResponse.prepareJsonResponse(res, playerPoll);
}

export async function sendAnswer(req: Request, res: Response) {
    const playerPollId = req.params.playerPollId?.toString();
    const userId = req.params.userId?.toString();
    const requestTime = req.params.requestTime?.toString();

    if (!playerPollId) {
        return appResponse.prepareErrorResponse(
            res,
            ErrorsAdapter.Poll.createError(ErrorsAdapter.Poll.ErrorsEnum.PLAYER_POLL_NOT_FOUND)
        );
    }

    const { questionNumber, response } = req.body as {
        questionNumber: number;
        response?: string;
    };

    const updatedPoll = await playerPollService.Helpers.processAnswer({
        playerPollId,
        playerId: userId,
        questionNumber: Number(questionNumber),
        respondAt: requestTime ?? new Date().toISOString(),
        response,
    });

    return appResponse.prepareJsonResponse(res, updatedPoll);
}

export default function setup(router: Router) {
    router.get(
        appRoute.getMap().poll.getQuestions,
        security.validateAuthenticatedRequest,
        getQuestions
    );

    router.get(
        appRoute.getMap().poll.getQuestion,
        security.validateAuthenticatedRequest,
        validateGetQuestion,
        getQuestion
    );

    router.post(
        appRoute.getMap().poll.startPoll,
        security.validateAuthenticatedRequest,
        validateStartPoll,
        startPoll
    );

    router.get(
        appRoute.getMap().poll.getPlayerPolls,
        security.validateAuthenticatedRequest,
        getPlayerPolls
    );

    router.get(
        appRoute.getMap().poll.getPlayerPoll,
        security.validateAuthenticatedRequest,
        security.validateParams,
        getPlayerPoll
    );

    router.post(
        appRoute.getMap().poll.sendAnswer,
        security.validateAuthenticatedRequest,
        security.validateParams,
        useRequestTime,
        validateSendAnswer,
        sendAnswer
    );
}
