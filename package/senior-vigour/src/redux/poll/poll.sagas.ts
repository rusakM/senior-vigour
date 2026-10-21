import { takeLatest, put, all, call } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { PollActionTypes } from './poll.types';
import * as Api from '../../api/index';
import {
    fetchQuestionsSuccess,
    fetchQuestionsFailure,
    startPollSuccess,
    startPollFailure,
    submitAnswerSuccess,
    submitAnswerFailure,
} from './poll.actions';
import type {
    IPlayerPoll,
    IQuestion,
    IStartPollPayload,
    ISubmitAnswerPayload,
} from '../../types/poll';
import { constantsUrls } from '../../helpers/constants';

const startPollStartAction = createAction<IStartPollPayload | undefined>(
    PollActionTypes.START_POLL_START
);

const fetchQuestionsStartAction = createAction(PollActionTypes.FETCH_QUESTIONS_START);

const submitAnswerStartAction = createAction<ISubmitAnswerPayload>(
    PollActionTypes.SUBMIT_ANSWER_START
);

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
        const errObj = error as { name?: string; message?: string; error?: string };
        if (errObj.error) return errObj.error;
        if (errObj.message) return errObj.message;
        if (errObj.name) return errObj.name;
    }
    if (typeof error === 'string') return error;
    return fallback;
}

export function* startPoll({ payload }: ReturnType<typeof startPollStartAction>) {
    try {
        const activePoll: IPlayerPoll = yield call(
            Api.sendData,
            constantsUrls.Poll.start,
            payload ?? {},
            'POST'
        );
        const questions: IQuestion[] = yield call(
            Api.getData,
            constantsUrls.Poll.questions
        );
        yield put(startPollSuccess({ activePoll, questions: questions || [] }));
    } catch (error: unknown) {
        yield put(startPollFailure(getErrorMessage(error, 'Failed to start poll')));
    }
}

export function* fetchQuestions() {
    try {
        const questions: IQuestion[] = yield call(
            Api.getData,
            constantsUrls.Poll.questions
        );
        yield put(fetchQuestionsSuccess(questions || []));
    } catch (error: unknown) {
        yield put(
            fetchQuestionsFailure(getErrorMessage(error, 'Failed to fetch questions'))
        );
    }
}

export function* submitAnswer({ payload }: ReturnType<typeof submitAnswerStartAction>) {
    try {
        const updatedPoll: IPlayerPoll = yield call(
            Api.sendData,
            `${constantsUrls.Poll.pollById}/${payload.playerPollId}/answer`,
            {
                questionNumber: payload.questionNumber,
                response: payload.response,
            },
            'POST'
        );
        yield put(submitAnswerSuccess(updatedPoll));
    } catch (error: unknown) {
        yield put(
            submitAnswerFailure(getErrorMessage(error, 'Failed to submit answer'))
        );
    }
}

function* onStartPollStart() {
    yield takeLatest(startPollStartAction.type, startPoll);
}

function* onFetchQuestionsStart() {
    yield takeLatest(fetchQuestionsStartAction.type, fetchQuestions);
}

function* onSubmitAnswerStart() {
    yield takeLatest(submitAnswerStartAction.type, submitAnswer);
}

export function* pollSagas() {
    yield all([
        call(onStartPollStart),
        call(onFetchQuestionsStart),
        call(onSubmitAnswerStart),
    ]);
}
