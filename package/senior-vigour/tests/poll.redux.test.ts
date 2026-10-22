import { describe, it, expect } from 'vitest';
import { call, put } from 'redux-saga/effects';
import * as actions from '../src/redux/poll/poll.actions';
import pollReducer, { INITIAL_STATE } from '../src/redux/poll/poll.reducer';
import { PollActionTypes, type IPollState } from '../src/redux/poll/poll.types';
import * as selectors from '../src/redux/poll/poll.selectors';
import {
    startPoll,
    fetchQuestions,
    fetchPlayerPoll,
    submitAnswer,
} from '../src/redux/poll/poll.sagas';
import * as Api from '../src/api/index';
import type { RootState } from '../src/redux/store.types';
import {
    type IPlayerPoll,
    type IQuestion,
    PollStatusEnum,
    QuestionCategoryEnum,
    QuestionTypeEnum,
} from '../src/types/poll';
import { constantsUrls } from '../src/helpers/constants';

const mockQuestions: IQuestion[] = [
    {
        _id: 'q-1',
        questionNumber: 1,
        category: QuestionCategoryEnum.MENTAL_HEALTH,
        type: QuestionTypeEnum.SINGLE_CHOOSE,
        question: 'How often do you practice mindfulness?',
        answers: ['Daily', 'Weekly', 'Rarely', 'Never'],
        correctAnswer: '0',
    },
    {
        _id: 'q-2',
        questionNumber: 2,
        category: QuestionCategoryEnum.PHYSICAL_HEALTH,
        type: QuestionTypeEnum.TRUE_FALSE,
        question: 'Walking 30 minutes a day improves cardiovascular health.',
        answers: ['True', 'False'],
        correctAnswer: '0',
    },
];

const mockActivePoll: IPlayerPoll = {
    _id: 'poll-123',
    playerId: 'user-1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    status: PollStatusEnum.STARTED,
    answers: [],
    categoryScores: [],
    score: 0,
};

describe('Poll Redux Module', () => {
    describe('Actions', () => {
        it('creates fetchQuestionsStart action', () => {
            expect(actions.fetchQuestionsStart()).toEqual({
                type: PollActionTypes.FETCH_QUESTIONS_START,
            });
        });

        it('creates fetchQuestionsSuccess action', () => {
            expect(actions.fetchQuestionsSuccess(mockQuestions)).toEqual({
                type: PollActionTypes.FETCH_QUESTIONS_SUCCESS,
                payload: mockQuestions,
            });
        });

        it('creates fetchQuestionsFailure action', () => {
            expect(actions.fetchQuestionsFailure('Error loading questions')).toEqual({
                type: PollActionTypes.FETCH_QUESTIONS_FAILURE,
                payload: 'Error loading questions',
            });
        });

        it('creates fetchPlayerPollStart, fetchPlayerPollSuccess, and fetchPlayerPollFailure actions', () => {
            expect(actions.fetchPlayerPollStart('poll-123')).toEqual({
                type: PollActionTypes.FETCH_PLAYER_POLL_START,
                payload: 'poll-123',
            });
            expect(actions.fetchPlayerPollSuccess(mockActivePoll)).toEqual({
                type: PollActionTypes.FETCH_PLAYER_POLL_SUCCESS,
                payload: mockActivePoll,
            });
            expect(actions.fetchPlayerPollFailure('Poll not found')).toEqual({
                type: PollActionTypes.FETCH_PLAYER_POLL_FAILURE,
                payload: 'Poll not found',
            });
        });

        it('creates startPollStart action', () => {
            const payload = { firstName: 'Anna', lastName: 'Nowak' };
            expect(actions.startPollStart(payload)).toEqual({
                type: PollActionTypes.START_POLL_START,
                payload,
            });
        });

        it('creates startPollSuccess action', () => {
            const payload = { activePoll: mockActivePoll, questions: mockQuestions };
            expect(actions.startPollSuccess(payload)).toEqual({
                type: PollActionTypes.START_POLL_SUCCESS,
                payload,
            });
        });

        it('creates startPollFailure action', () => {
            expect(actions.startPollFailure('Start error')).toEqual({
                type: PollActionTypes.START_POLL_FAILURE,
                payload: 'Start error',
            });
        });

        it('creates submitAnswerStart action', () => {
            const payload = {
                playerPollId: 'poll-123',
                questionNumber: 1,
                response: '0',
            };
            expect(actions.submitAnswerStart(payload)).toEqual({
                type: PollActionTypes.SUBMIT_ANSWER_START,
                payload,
            });
        });

        it('creates submitAnswerSuccess action', () => {
            expect(actions.submitAnswerSuccess(mockActivePoll)).toEqual({
                type: PollActionTypes.SUBMIT_ANSWER_SUCCESS,
                payload: mockActivePoll,
            });
        });

        it('creates submitAnswerFailure action', () => {
            expect(actions.submitAnswerFailure('Submit error')).toEqual({
                type: PollActionTypes.SUBMIT_ANSWER_FAILURE,
                payload: 'Submit error',
            });
        });

        it('creates setSeniorDetails action', () => {
            const details = { firstName: 'Anna', lastName: 'Nowak' };
            expect(actions.setSeniorDetails(details)).toEqual({
                type: PollActionTypes.SET_SENIOR_DETAILS,
                payload: details,
            });
        });

        it('creates resetPollState action', () => {
            expect(actions.resetPollState()).toEqual({
                type: PollActionTypes.RESET_POLL_STATE,
            });
        });
    });

    describe('Reducer', () => {
        it('returns initial state by default', () => {
            expect(pollReducer(undefined, { type: 'UNKNOWN' })).toEqual(INITIAL_STATE);
        });

        it('handles FETCH_QUESTIONS_START, SUCCESS, and FAILURE', () => {
            const loadingState = pollReducer(
                INITIAL_STATE,
                actions.fetchQuestionsStart()
            );
            expect(loadingState.isFetchingQuestions).toBe(true);
            expect(loadingState.error).toBeNull();

            const successState = pollReducer(
                loadingState,
                actions.fetchQuestionsSuccess(mockQuestions)
            );
            expect(successState.isFetchingQuestions).toBe(false);
            expect(successState.questions).toEqual(mockQuestions);

            const failState = pollReducer(
                loadingState,
                actions.fetchQuestionsFailure('Failed')
            );
            expect(failState.isFetchingQuestions).toBe(false);
            expect(failState.error).toBe('Failed');
        });

        it('handles FETCH_PLAYER_POLL_START, SUCCESS, and FAILURE', () => {
            const loadingState = pollReducer(
                INITIAL_STATE,
                actions.fetchPlayerPollStart('poll-123')
            );
            expect(loadingState.isFetchingPlayerPoll).toBe(true);
            expect(loadingState.error).toBeNull();

            const successState = pollReducer(
                loadingState,
                actions.fetchPlayerPollSuccess(mockActivePoll)
            );
            expect(successState.isFetchingPlayerPoll).toBe(false);
            expect(successState.activePoll).toEqual(mockActivePoll);

            const failState = pollReducer(
                loadingState,
                actions.fetchPlayerPollFailure('Poll not found')
            );
            expect(failState.isFetchingPlayerPoll).toBe(false);
            expect(failState.error).toBe('Poll not found');
        });

        it('handles START_POLL_START, SUCCESS, and FAILURE', () => {
            const startingState = pollReducer(
                { ...INITIAL_STATE, currentQuestionIndex: 3 },
                actions.startPollStart({ firstName: 'Jan', lastName: 'Kowalski' })
            );
            expect(startingState.isStartingPoll).toBe(true);

            const startedState = pollReducer(
                startingState,
                actions.startPollSuccess({
                    activePoll: mockActivePoll,
                    questions: mockQuestions,
                })
            );
            expect(startedState.isStartingPoll).toBe(false);
            expect(startedState.activePoll).toEqual(mockActivePoll);
            expect(startedState.questions).toEqual(mockQuestions);
            expect(startedState.currentQuestionIndex).toBe(0);

            const failedState = pollReducer(
                startingState,
                actions.startPollFailure('Cannot start poll')
            );
            expect(failedState.isStartingPoll).toBe(false);
            expect(failedState.error).toBe('Cannot start poll');
        });

        it('handles SUBMIT_ANSWER_START, SUCCESS (increments currentQuestionIndex), and FAILURE', () => {
            const activeState: IPollState = {
                ...INITIAL_STATE,
                activePoll: mockActivePoll,
                questions: mockQuestions,
                currentQuestionIndex: 0,
            };

            const submittingState = pollReducer(
                activeState,
                actions.submitAnswerStart({
                    playerPollId: 'poll-123',
                    questionNumber: 1,
                    response: '0',
                })
            );
            expect(submittingState.isSubmittingAnswer).toBe(true);

            const updatedPoll: IPlayerPoll = {
                ...mockActivePoll,
                answers: [{ questionNumber: 1, response: '0', points: 1 }],
            };

            const submittedState = pollReducer(
                submittingState,
                actions.submitAnswerSuccess(updatedPoll)
            );
            expect(submittedState.isSubmittingAnswer).toBe(false);
            expect(submittedState.activePoll).toEqual(updatedPoll);
            expect(submittedState.currentQuestionIndex).toBe(1);

            const failedState = pollReducer(
                submittingState,
                actions.submitAnswerFailure('Failed to submit')
            );
            expect(failedState.isSubmittingAnswer).toBe(false);
            expect(failedState.error).toBe('Failed to submit');
        });

        it('handles SET_SENIOR_DETAILS and RESET_POLL_STATE', () => {
            const withSenior = pollReducer(
                INITIAL_STATE,
                actions.setSeniorDetails({ firstName: 'Maria', lastName: 'Wisniewska' })
            );
            expect(withSenior.seniorDetails).toEqual({
                firstName: 'Maria',
                lastName: 'Wisniewska',
            });

            const reset = pollReducer(withSenior, actions.resetPollState());
            expect(reset).toEqual(INITIAL_STATE);
        });
    });

    describe('Selectors', () => {
        const mockRootState: RootState = {
            user: {
                currentUser: null,
                isFetching: false,
                signInEmail: '',
                userError: '',
            },
            materials: {
                materialsByCategory: {},
                selectedCategory: 'MENTAL_HEALTH',
                isFetching: false,
                error: null,
            },
            poll: {
                questions: mockQuestions,
                currentQuestionIndex: 1,
                activePoll: mockActivePoll,
                seniorDetails: { firstName: 'Jan', lastName: 'Kowalski' },
                isFetchingQuestions: false,
                isFetchingPlayerPoll: true,
                isStartingPoll: false,
                isSubmittingAnswer: true,
                error: 'Sample error',
            },
        };

        it('selects poll state slices accurately', () => {
            expect(selectors.selectPollQuestions(mockRootState)).toEqual(mockQuestions);
            expect(selectors.selectCurrentQuestionIndex(mockRootState)).toBe(1);
            expect(selectors.selectCurrentQuestion(mockRootState)).toEqual(
                mockQuestions[1]
            );
            expect(selectors.selectActivePoll(mockRootState)).toEqual(mockActivePoll);
            expect(selectors.selectSeniorDetails(mockRootState)).toEqual({
                firstName: 'Jan',
                lastName: 'Kowalski',
            });
            expect(selectors.selectIsFetchingQuestions(mockRootState)).toBe(false);
            expect(selectors.selectIsFetchingPlayerPoll(mockRootState)).toBe(true);
            expect(selectors.selectIsStartingPoll(mockRootState)).toBe(false);
            expect(selectors.selectIsSubmittingAnswer(mockRootState)).toBe(true);
            expect(selectors.selectPollError(mockRootState)).toBe('Sample error');
        });

        it('returns null for selectCurrentQuestion when index is out of bounds', () => {
            const outOfBoundsState: RootState = {
                ...mockRootState,
                poll: {
                    ...mockRootState.poll,
                    currentQuestionIndex: 5,
                },
            };
            expect(selectors.selectCurrentQuestion(outOfBoundsState)).toBeNull();
        });
    });

    describe('Sagas', () => {
        it('startPoll saga starts poll and fetches questions on success', () => {
            const payload = { firstName: 'Anna', lastName: 'Kowalska' };
            const gen = startPoll({
                type: PollActionTypes.START_POLL_START,
                payload,
            });

            expect(gen.next().value).toEqual(
                call(Api.sendData, constantsUrls.Poll.start, payload, 'POST')
            );
            expect(gen.next(mockActivePoll).value).toEqual(
                call(Api.getData, constantsUrls.Poll.questions)
            );
            expect(gen.next(mockQuestions).value).toEqual(
                put(
                    actions.startPollSuccess({
                        activePoll: mockActivePoll,
                        questions: mockQuestions,
                    })
                )
            );
            expect(gen.next().done).toBe(true);
        });

        it('startPoll saga dispatches startPollFailure on error', () => {
            const gen = startPoll({
                type: PollActionTypes.START_POLL_START,
                payload: undefined,
            });

            expect(gen.next().value).toEqual(
                call(Api.sendData, constantsUrls.Poll.start, {}, 'POST')
            );
            expect(gen.throw({ message: 'Failed to start' }).value).toEqual(
                put(actions.startPollFailure('Failed to start'))
            );
            expect(gen.next().done).toBe(true);
        });

        it('fetchQuestions saga fetches questions and dispatches success', () => {
            const gen = fetchQuestions();
            expect(gen.next().value).toEqual(
                call(Api.getData, constantsUrls.Poll.questions)
            );
            expect(gen.next(mockQuestions).value).toEqual(
                put(actions.fetchQuestionsSuccess(mockQuestions))
            );
            expect(gen.next().done).toBe(true);
        });

        it('fetchPlayerPoll saga fetches poll by id and dispatches success or failure', () => {
            const gen = fetchPlayerPoll({
                type: PollActionTypes.FETCH_PLAYER_POLL_START,
                payload: 'poll-123',
            });

            expect(gen.next().value).toEqual(
                call(Api.getData, `${constantsUrls.Poll.pollById}/poll-123`)
            );
            expect(gen.next(mockActivePoll).value).toEqual(
                put(actions.fetchPlayerPollSuccess(mockActivePoll))
            );
            expect(gen.next().done).toBe(true);

            const errGen = fetchPlayerPoll({
                type: PollActionTypes.FETCH_PLAYER_POLL_START,
                payload: 'poll-404',
            });
            expect(errGen.next().value).toEqual(
                call(Api.getData, `${constantsUrls.Poll.pollById}/poll-404`)
            );
            expect(errGen.throw({ message: 'Poll not found' }).value).toEqual(
                put(actions.fetchPlayerPollFailure('Poll not found'))
            );
            expect(errGen.next().done).toBe(true);
        });

        it('submitAnswer saga sends answer and dispatches submitAnswerSuccess', () => {
            const payload = {
                playerPollId: 'poll-123',
                questionNumber: 1,
                response: '0',
            };
            const gen = submitAnswer({
                type: PollActionTypes.SUBMIT_ANSWER_START,
                payload,
            });

            expect(gen.next().value).toEqual(
                call(
                    Api.sendData,
                    `${constantsUrls.Poll.pollById}/poll-123/answer`,
                    { questionNumber: 1, response: '0' },
                    'POST'
                )
            );
            expect(gen.next(mockActivePoll).value).toEqual(
                put(actions.submitAnswerSuccess(mockActivePoll))
            );
            expect(gen.next().done).toBe(true);
        });
    });
});
