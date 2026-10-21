import type { UnknownAction } from '@reduxjs/toolkit';
import { type IPollState, PollActionTypes } from './poll.types';
import type { IPlayerPoll, IQuestion } from '../../types/poll';

export const INITIAL_STATE: IPollState = {
    questions: [],
    currentQuestionIndex: 0,
    activePoll: null,
    seniorDetails: null,
    isFetchingQuestions: false,
    isStartingPoll: false,
    isSubmittingAnswer: false,
    error: null,
};

const pollReducer = (
    state: IPollState = INITIAL_STATE,
    action: UnknownAction
): IPollState => {
    switch (action.type) {
        case PollActionTypes.FETCH_QUESTIONS_START:
            return {
                ...state,
                isFetchingQuestions: true,
                error: null,
            };
        case PollActionTypes.FETCH_QUESTIONS_SUCCESS:
            return {
                ...state,
                isFetchingQuestions: false,
                questions: action.payload as IQuestion[],
                error: null,
            };
        case PollActionTypes.FETCH_QUESTIONS_FAILURE:
            return {
                ...state,
                isFetchingQuestions: false,
                error: action.payload as string,
            };
        case PollActionTypes.START_POLL_START:
            return {
                ...state,
                isStartingPoll: true,
                error: null,
            };
        case PollActionTypes.START_POLL_SUCCESS: {
            const { activePoll, questions } = action.payload as {
                activePoll: IPlayerPoll;
                questions: IQuestion[];
            };
            return {
                ...state,
                isStartingPoll: false,
                activePoll,
                questions,
                currentQuestionIndex: 0,
                error: null,
            };
        }
        case PollActionTypes.START_POLL_FAILURE:
            return {
                ...state,
                isStartingPoll: false,
                error: action.payload as string,
            };
        case PollActionTypes.SUBMIT_ANSWER_START:
            return {
                ...state,
                isSubmittingAnswer: true,
                error: null,
            };
        case PollActionTypes.SUBMIT_ANSWER_SUCCESS:
            return {
                ...state,
                isSubmittingAnswer: false,
                activePoll: action.payload as IPlayerPoll,
                currentQuestionIndex: state.currentQuestionIndex + 1,
                error: null,
            };
        case PollActionTypes.SUBMIT_ANSWER_FAILURE:
            return {
                ...state,
                isSubmittingAnswer: false,
                error: action.payload as string,
            };
        case PollActionTypes.SET_SENIOR_DETAILS:
            return {
                ...state,
                seniorDetails: action.payload as { firstName: string; lastName: string } | null,
            };
        case PollActionTypes.RESET_POLL_STATE:
            return INITIAL_STATE;
        default:
            return state;
    }
};

export default pollReducer;
