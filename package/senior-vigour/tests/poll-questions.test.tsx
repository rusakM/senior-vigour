import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import rootReducer from '../src/redux/root-reducer';
import Questionnaire from '../src/pages/questionnaire/questionnaire';
import SingleChoose from '../src/pages/questionnaire/components/questions/single-choose/single-choose';
import MultiChoose from '../src/pages/questionnaire/components/questions/multi-choose/multi-choose';
import TrueFalse from '../src/pages/questionnaire/components/questions/true-false/true-false';
import ImgChoose from '../src/pages/questionnaire/components/questions/img-choose/img-choose';
import SelectCorrectOrder from '../src/pages/questionnaire/components/questions/select-correct-order/select-correct-order';
import {
    type IPlayerPoll,
    type IQuestion,
    PollStatusEnum,
    QuestionCategoryEnum,
    QuestionTypeEnum,
} from '../src/types/poll';
import { UserRoleEnum, type IUser } from '../src/types/user';
import { constantsUrls } from '../src/helpers/constants';
import { INITIAL_STATE as POLL_INITIAL_STATE } from '../src/redux/poll/poll.reducer';
import type { IPollState } from '../src/redux/poll/poll.types';

vi.mock('../src/helpers/responsiveContainers', () => ({
    useMobile: () => false,
}));

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (_key: string, defaultValue?: string) => defaultValue || _key,
        }),
    };
});

const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
    };
});

const seniorUser: IUser = {
    _id: 'user-senior-1',
    email: 'senior@example.com',
    firstName: 'Jan',
    lastName: 'Kowalski',
    role: UserRoleEnum.SENIOR,
};

const createPollTestStore = (
    pollOverrides: Partial<IPollState> = {},
    currentUser: IUser | null = seniorUser
) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            user: {
                currentUser,
                isFetching: false,
                signInEmail: '',
                userError: '',
            },
            poll: {
                ...POLL_INITIAL_STATE,
                ...pollOverrides,
            },
        },
    });
};

describe('Poll Question Components & Questionnaire Integration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('1. SingleChoose Component', () => {
        const singleChooseQuestion: IQuestion = {
            questionNumber: 1,
            category: QuestionCategoryEnum.MENTAL_HEALTH,
            type: QuestionTypeEnum.SINGLE_CHOOSE,
            question: 'Which activity best supports memory?',
            answers: [
                'Learning a new skill',
                'Watching TV all day',
                'Skipping sleep',
                'Avoiding social contact',
            ],
            correctAnswer: '0',
        };

        it('renders question, options A-D, enables Next button after selecting an option, and submits index string', () => {
            const onSubmitAnswer = vi.fn();
            render(
                <SingleChoose
                    question={singleChooseQuestion}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );

            expect(
                screen.getByRole('heading', {
                    name: 'Which activity best supports memory?',
                })
            ).toBeInTheDocument();

            const nextBtn = screen.getByTestId('poll-next-button');
            expect(nextBtn).toBeDisabled();

            const option0 = screen.getByTestId('poll-option-0');
            const option2 = screen.getByTestId('poll-option-2');

            expect(option0).toHaveTextContent('A');
            expect(option0).toHaveTextContent('Learning a new skill');
            expect(option2).toHaveTextContent('C');
            expect(option2).toHaveTextContent('Skipping sleep');

            fireEvent.click(option2);
            expect(option2).toHaveAttribute('aria-pressed', 'true');
            expect(nextBtn).not.toBeDisabled();

            fireEvent.click(nextBtn);
            expect(onSubmitAnswer).toHaveBeenCalledWith('2');
        });
    });

    describe('2. MultiChoose Component', () => {
        const multiChooseQuestion: IQuestion = {
            questionNumber: 2,
            category: QuestionCategoryEnum.NUTRITION,
            type: QuestionTypeEnum.MULTI_CHOOSE,
            question: 'Select healthy sources of protein:',
            answers: ['Lentils', 'Soda', 'Fish', 'Candy'],
            correctAnswer: '[0,2]',
        };

        it('allows toggling multiple options and submits sorted JSON array of indices', () => {
            const onSubmitAnswer = vi.fn();
            render(
                <MultiChoose
                    question={multiChooseQuestion}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );

            const nextBtn = screen.getByTestId('poll-next-button');
            expect(nextBtn).toBeDisabled();

            const option0 = screen.getByTestId('poll-option-0');
            const option1 = screen.getByTestId('poll-option-1');
            const option2 = screen.getByTestId('poll-option-2');

            // Select index 2 first, then index 0, then toggle index 1 on and off
            fireEvent.click(option2);
            fireEvent.click(option0);
            fireEvent.click(option1);
            expect(option1).toHaveAttribute('aria-pressed', 'true');

            fireEvent.click(option1);
            expect(option1).toHaveAttribute('aria-pressed', 'false');

            expect(nextBtn).not.toBeDisabled();
            fireEvent.click(nextBtn);

            expect(onSubmitAnswer).toHaveBeenCalledWith('[0,2]');
        });
    });

    describe('3. TrueFalse Component', () => {
        const trueFalseQuestion: IQuestion = {
            questionNumber: 3,
            category: QuestionCategoryEnum.PHYSICAL_HEALTH,
            type: QuestionTypeEnum.TRUE_FALSE,
            question: 'Regular stretching improves flexibility.',
            answers: ['True', 'False'],
            correctAnswer: '0',
        };

        it('renders True and False buttons and submits selected index string', () => {
            const onSubmitAnswer = vi.fn();
            render(
                <TrueFalse
                    question={trueFalseQuestion}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );

            const nextBtn = screen.getByTestId('poll-next-button');
            expect(nextBtn).toBeDisabled();

            const trueBtn = screen.getByTestId('poll-option-0');
            const falseBtn = screen.getByTestId('poll-option-1');

            expect(trueBtn).toHaveTextContent('True');
            expect(falseBtn).toHaveTextContent('False');

            fireEvent.click(falseBtn);
            expect(falseBtn).toHaveAttribute('aria-pressed', 'true');
            expect(nextBtn).not.toBeDisabled();

            fireEvent.click(nextBtn);
            expect(onSubmitAnswer).toHaveBeenCalledWith('1');
        });
    });

    describe('4. ImgChoose Component', () => {
        const imgChooseQuestion: IQuestion = {
            questionNumber: 4,
            category: QuestionCategoryEnum.ECOLOGY,
            type: QuestionTypeEnum.IMG_CHOOSE,
            question: 'Which bin is used for paper recycling?',
            answers: [
                '/cdn/images/bin-blue.png',
                'Green glass bin',
                'Yellow plastic bin',
                'Brown bio bin',
            ],
            correctAnswer: '0',
        };

        it('renders image or caption cards with letter strips A-D and submits selected index string', () => {
            const onSubmitAnswer = vi.fn();
            render(
                <ImgChoose
                    question={imgChooseQuestion}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );

            const nextBtn = screen.getByTestId('poll-next-button');
            expect(nextBtn).toBeDisabled();

            const option0 = screen.getByTestId('poll-option-0');
            const option1 = screen.getByTestId('poll-option-1');

            expect(screen.getByTestId('poll-option-letter-0')).toHaveTextContent('A');
            expect(screen.getByTestId('poll-option-letter-1')).toHaveTextContent('B');

            // Option 0 has an image URL so it renders an img
            expect(option0.querySelector('img')).not.toBeNull();
            // Option 1 has text description so it renders caption text
            expect(option1).toHaveTextContent('Green glass bin');

            fireEvent.click(option1);
            expect(option1).toHaveAttribute('aria-pressed', 'true');
            expect(nextBtn).not.toBeDisabled();

            fireEvent.click(nextBtn);
            expect(onSubmitAnswer).toHaveBeenCalledWith('1');
        });
    });

    describe('5. SelectCorrectOrder Component', () => {
        const orderQuestion: IQuestion = {
            questionNumber: 5,
            category: QuestionCategoryEnum.DIGITAL_TECHNOLOGIES,
            type: QuestionTypeEnum.SELECT_CORRECT_ORDER,
            question: 'Connect the following concepts with matching descriptions:',
            subquestions: [
                'Internet browser',
                'Email',
                'Video call app',
            ],
            answers: [
                'Used to search and visit websites',
                'Used to send and receive messages online',
                'Used to talk and see people online',
            ],
            correctAnswer: '[1,0,2]',
        };

        it('clears previous row selection when a duplicate order number is selected and submits JSON array once all rows are filled', () => {
            const onSubmitAnswer = vi.fn();
            render(
                <SelectCorrectOrder
                    question={orderQuestion}
                    onSubmitAnswer={onSubmitAnswer}
                />
            );

            const nextBtn = screen.getByTestId('poll-next-button');
            expect(nextBtn).toBeDisabled();

            const select0 = screen.getByTestId('order-select-0') as HTMLSelectElement;
            const select1 = screen.getByTestId('order-select-1') as HTMLSelectElement;
            const select2 = screen.getByTestId('order-select-2') as HTMLSelectElement;

            expect(screen.getByTestId('order-row-0')).toHaveTextContent(
                '1. Internet browser'
            );
            expect(screen.getByTestId('order-row-1')).toHaveTextContent(
                '2. Email'
            );
            expect(screen.getByTestId('order-row-2')).toHaveTextContent(
                '3. Video call app'
            );

            // Select order index 0 in row 0
            fireEvent.change(select0, { target: { value: '0' } });
            expect(select0.value).toBe('0');

            // Now select the SAME order index 0 in row 1 -> row 0 must automatically clear to ""
            fireEvent.change(select1, { target: { value: '0' } });
            expect(select1.value).toBe('0');
            expect(select0.value).toBe('');
            expect(nextBtn).toBeDisabled();

            // Complete all rows with unique values: row 0 -> 2, row 1 -> 0, row 2 -> 1
            fireEvent.change(select0, { target: { value: '2' } });
            fireEvent.change(select2, { target: { value: '1' } });

            expect(select0.value).toBe('2');
            expect(select1.value).toBe('0');
            expect(select2.value).toBe('1');
            expect(nextBtn).not.toBeDisabled();

            fireEvent.click(nextBtn);
            expect(onSubmitAnswer).toHaveBeenCalledWith('[2,0,1]');
        });
    });

    describe('6. Questionnaire Page Integration (Header Counter, Category Title, Finish Redirect)', () => {
        const activePoll: IPlayerPoll = {
            _id: 'poll-active-1',
            playerId: 'user-senior-1',
            firstName: 'Jan',
            lastName: 'Kowalski',
            status: PollStatusEnum.STARTED,
            answers: [],
            categoryScores: [],
            score: 0,
        };

        const sampleQuestions: IQuestion[] = [
            {
                questionNumber: 1,
                category: QuestionCategoryEnum.SOCIAL_INTERACTIONS,
                type: QuestionTypeEnum.SINGLE_CHOOSE,
                question: 'How do you stay in touch with friends?',
                answers: ['Phone calls', 'Meetings', 'Letters', 'Never'],
                correctAnswer: '0',
            },
            {
                questionNumber: 2,
                category: QuestionCategoryEnum.DIGITAL_TECHNOLOGIES,
                type: QuestionTypeEnum.TRUE_FALSE,
                question: 'Strong passwords should include symbols and numbers.',
                answers: ['True', 'False'],
                correctAnswer: '0',
            },
        ];

        it('displays translated category title, question counter, and active question when poll is STARTED', () => {
            const store = createPollTestStore({
                activePoll,
                questions: sampleQuestions,
                currentQuestionIndex: 0,
            });

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            // Category header title for SOCIAL_INTERACTIONS
            expect(
                screen.getByRole('heading', { name: 'Social interactions' })
            ).toBeInTheDocument();

            // Question counter
            expect(
                screen.getByTestId('questionnaire-question-counter')
            ).toHaveTextContent('QUESTION 1 of 2');

            // Active question content
            expect(
                screen.getByRole('heading', {
                    name: 'How do you stay in touch with friends?',
                })
            ).toBeInTheDocument();
        });

        it('redirects to /diagnostic-results/:playerPollId when poll status is FINISHED', () => {
            const finishedPoll: IPlayerPoll = {
                ...activePoll,
                status: PollStatusEnum.FINISHED,
            };

            const store = createPollTestStore({
                activePoll: finishedPoll,
                questions: sampleQuestions,
                currentQuestionIndex: 2,
            });

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            expect(mockedNavigate).toHaveBeenCalledWith(
                constantsUrls.Main.pollResults.replace(
                    ':playerPollId',
                    'poll-active-1'
                )
            );
        });
    });
});
