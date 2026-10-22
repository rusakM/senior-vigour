import { createSelector } from 'reselect';
import type { RootState } from '../store.types';
import type { IPollState } from './poll.types';
import type { IPlayerPoll, IQuestion } from '../../types/poll';

const selectPollState = (state: RootState): IPollState => state.poll;

export const selectPollQuestions = createSelector(
    [selectPollState],
    (poll): IQuestion[] => poll.questions
);

export const selectCurrentQuestionIndex = createSelector(
    [selectPollState],
    (poll): number => poll.currentQuestionIndex
);

export const selectCurrentQuestion = createSelector(
    [selectPollQuestions, selectCurrentQuestionIndex],
    (questions, currentIndex): IQuestion | null => questions[currentIndex] || null
);

export const selectActivePoll = createSelector(
    [selectPollState],
    (poll): IPlayerPoll | null => poll.activePoll
);

export const selectSeniorDetails = createSelector(
    [selectPollState],
    (poll): { firstName: string; lastName: string } | null => poll.seniorDetails
);

export const selectIsFetchingQuestions = createSelector(
    [selectPollState],
    (poll): boolean => poll.isFetchingQuestions
);

export const selectIsFetchingPlayerPoll = createSelector(
    [selectPollState],
    (poll): boolean => poll.isFetchingPlayerPoll
);

export const selectIsStartingPoll = createSelector(
    [selectPollState],
    (poll): boolean => poll.isStartingPoll
);

export const selectIsSubmittingAnswer = createSelector(
    [selectPollState],
    (poll): boolean => poll.isSubmittingAnswer
);

export const selectPollError = createSelector(
    [selectPollState],
    (poll): string | null => poll.error
);
