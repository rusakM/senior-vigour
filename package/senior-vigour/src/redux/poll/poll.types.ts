import type { IPlayerPoll, IQuestion } from '../../types/poll';

export const PollActionTypes = {
    FETCH_QUESTIONS_START: 'FETCH_QUESTIONS_START',
    FETCH_QUESTIONS_SUCCESS: 'FETCH_QUESTIONS_SUCCESS',
    FETCH_QUESTIONS_FAILURE: 'FETCH_QUESTIONS_FAILURE',
    START_POLL_START: 'START_POLL_START',
    START_POLL_SUCCESS: 'START_POLL_SUCCESS',
    START_POLL_FAILURE: 'START_POLL_FAILURE',
    SUBMIT_ANSWER_START: 'SUBMIT_ANSWER_START',
    SUBMIT_ANSWER_SUCCESS: 'SUBMIT_ANSWER_SUCCESS',
    SUBMIT_ANSWER_FAILURE: 'SUBMIT_ANSWER_FAILURE',
    SET_SENIOR_DETAILS: 'SET_SENIOR_DETAILS',
    RESET_POLL_STATE: 'RESET_POLL_STATE',
} as const;

export interface IPollState {
    questions: IQuestion[];
    currentQuestionIndex: number;
    activePoll: IPlayerPoll | null;
    seniorDetails: { firstName: string; lastName: string } | null;
    isFetchingQuestions: boolean;
    isStartingPoll: boolean;
    isSubmittingAnswer: boolean;
    error: string | null;
}
