import { PollActionTypes } from './poll.types';
import type {
    IPlayerPoll,
    IQuestion,
    IStartPollPayload,
    ISubmitAnswerPayload,
} from '../../types/poll';

export const fetchQuestionsStart = () => ({
    type: PollActionTypes.FETCH_QUESTIONS_START,
});

export const fetchQuestionsSuccess = (questions: IQuestion[]) => ({
    type: PollActionTypes.FETCH_QUESTIONS_SUCCESS,
    payload: questions,
});

export const fetchQuestionsFailure = (error: string) => ({
    type: PollActionTypes.FETCH_QUESTIONS_FAILURE,
    payload: error,
});

export const fetchPlayerPollStart = (playerPollId: string) => ({
    type: PollActionTypes.FETCH_PLAYER_POLL_START,
    payload: playerPollId,
});

export const fetchPlayerPollSuccess = (poll: IPlayerPoll) => ({
    type: PollActionTypes.FETCH_PLAYER_POLL_SUCCESS,
    payload: poll,
});

export const fetchPlayerPollFailure = (error: string) => ({
    type: PollActionTypes.FETCH_PLAYER_POLL_FAILURE,
    payload: error,
});

export const fetchPlayerPollsStart = () => ({
    type: PollActionTypes.FETCH_PLAYER_POLLS_START,
});

export const fetchPlayerPollsSuccess = (polls: IPlayerPoll[]) => ({
    type: PollActionTypes.FETCH_PLAYER_POLLS_SUCCESS,
    payload: polls,
});

export const fetchPlayerPollsFailure = (error: string) => ({
    type: PollActionTypes.FETCH_PLAYER_POLLS_FAILURE,
    payload: error,
});

export const startPollStart = (payload?: IStartPollPayload) => ({
    type: PollActionTypes.START_POLL_START,
    payload,
});

export const startPollSuccess = (payload: {
    activePoll: IPlayerPoll;
    questions: IQuestion[];
}) => ({
    type: PollActionTypes.START_POLL_SUCCESS,
    payload,
});

export const startPollFailure = (error: string) => ({
    type: PollActionTypes.START_POLL_FAILURE,
    payload: error,
});

export const submitAnswerStart = (payload: ISubmitAnswerPayload) => ({
    type: PollActionTypes.SUBMIT_ANSWER_START,
    payload,
});

export const submitAnswerSuccess = (updatedPoll: IPlayerPoll) => ({
    type: PollActionTypes.SUBMIT_ANSWER_SUCCESS,
    payload: updatedPoll,
});

export const submitAnswerFailure = (error: string) => ({
    type: PollActionTypes.SUBMIT_ANSWER_FAILURE,
    payload: error,
});

export const setSeniorDetails = (
    details: { firstName: string; lastName: string } | null
) => ({
    type: PollActionTypes.SET_SENIOR_DETAILS,
    payload: details,
});

export const resetPollState = () => ({
    type: PollActionTypes.RESET_POLL_STATE,
});
