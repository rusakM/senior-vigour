import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import rootReducer from '../src/redux/root-reducer';
import DiagnosticResults from '../src/pages/diagnostic-results/diagnostic-results';
import { INITIAL_STATE as POLL_INITIAL_STATE } from '../src/redux/poll/poll.reducer';
import { PollActionTypes, type IPollState } from '../src/redux/poll/poll.types';
import {
    type IPlayerPoll,
    type IQuestion,
    PollStatusEnum,
    QuestionCategoryEnum,
    QuestionTypeEnum,
} from '../src/types/poll';
import { constantsUrls } from '../src/helpers/constants';

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

const createTestQuestions = (): IQuestion[] => {
    const categories = [
        QuestionCategoryEnum.MENTAL_HEALTH,
        QuestionCategoryEnum.PHYSICAL_HEALTH,
        QuestionCategoryEnum.NUTRITION,
        QuestionCategoryEnum.SOCIAL_INTERACTIONS,
        QuestionCategoryEnum.ECOLOGY,
        QuestionCategoryEnum.DIGITAL_TECHNOLOGIES,
    ];

    const questions: IQuestion[] = [];
    let qNum = 1;
    // 5 questions per category to verify normalization (e.g. 4/5 -> 8/10)
    for (const category of categories) {
        for (let i = 0; i < 5; i++) {
            questions.push({
                questionNumber: qNum++,
                category,
                type: QuestionTypeEnum.SINGLE_CHOOSE,
                question: `Question ${qNum}`,
                answers: ['A', 'B', 'C', 'D'],
                correctAnswer: '0',
            });
        }
    }
    return questions;
};

const mockPoll: IPlayerPoll = {
    _id: 'poll-abc-123',
    playerId: 'user-1',
    firstName: 'Jan',
    lastName: 'Kowalski',
    status: PollStatusEnum.FINISHED,
    score: 18,
    categoryScores: [
        { category: QuestionCategoryEnum.MENTAL_HEALTH, points: 4 }, // 4/5 -> 8/10 (GOOD)
        { category: QuestionCategoryEnum.PHYSICAL_HEALTH, points: 3 }, // 3/5 -> 6/10 (MODERATE)
        { category: QuestionCategoryEnum.NUTRITION, points: 5 }, // 5/5 -> 10/10 (GOOD)
        { category: QuestionCategoryEnum.SOCIAL_INTERACTIONS, points: 2 }, // 2/5 -> 4/10 (MODERATE)
        { category: QuestionCategoryEnum.ECOLOGY, points: 1 }, // 1/5 -> 2/10 (LOW)
        { category: QuestionCategoryEnum.DIGITAL_TECHNOLOGIES, points: 0 }, // 0/5 -> 0/10 (LOW)
    ],
};

const createTestStore = (
    pollOverrides: Partial<IPollState> = {},
    userOverrides: Record<string, any> = {}
) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            poll: {
                ...POLL_INITIAL_STATE,
                ...pollOverrides,
            },
            user: {
                currentUser: null,
                isFetching: false,
                signInEmail: '',
                userError: '',
                ...userOverrides,
            },
        },
    });
};

const renderDiagnosticResults = (
    store: ReturnType<typeof createTestStore>,
    playerPollId = 'poll-abc-123'
) => {
    return render(
        <Provider store={store}>
            <MemoryRouter
                initialEntries={[`/diagnostic-results/${playerPollId}`]}
            >
                <Routes>
                    <Route
                        path={constantsUrls.Main.pollResults}
                        element={<DiagnosticResults />}
                    />
                    <Route
                        path={constantsUrls.Main.diagnosticResults}
                        element={<DiagnosticResults />}
                    />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

describe('DiagnosticResults Screen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Summary banner and dispatches fetchPlayerPollStart + fetchQuestionsStart when not in store', () => {
        const store = createTestStore({
            activePoll: null,
            questions: [],
        });
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        renderDiagnosticResults(store, 'poll-xyz-999');

        expect(screen.getByTestId('diagnostic-banner')).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Summary' })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Recommendations sorted by areas requiring the most attention.'
            )
        ).toBeInTheDocument();

        expect(dispatchSpy).toHaveBeenCalledWith({
            type: PollActionTypes.FETCH_PLAYER_POLL_START,
            payload: 'poll-xyz-999',
        });
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: PollActionTypes.FETCH_QUESTIONS_START,
        });
    });

    it('normalizes scores out of 10 (e.g. 4/5 -> 8/10) and sorts categories ascending by lowest score first', () => {
        const store = createTestStore({
            activePoll: mockPoll,
            questions: createTestQuestions(),
        });

        renderDiagnosticResults(store);

        const list = screen.getByTestId('diagnostic-categories-list');
        const accordionCards = Array.from(list.children);

        // Expected ascending order of scores:
        // 1. DIGITAL_TECHNOLOGIES (0/10)
        // 2. ECOLOGY (2/10)
        // 3. SOCIAL_INTERACTIONS (4/10)
        // 4. PHYSICAL_HEALTH (6/10)
        // 5. MENTAL_HEALTH (8/10)
        // 6. NUTRITION (10/10)
        expect(accordionCards.map((el) => el.getAttribute('data-testid'))).toEqual([
            `category-accordion-${QuestionCategoryEnum.DIGITAL_TECHNOLOGIES}`,
            `category-accordion-${QuestionCategoryEnum.ECOLOGY}`,
            `category-accordion-${QuestionCategoryEnum.SOCIAL_INTERACTIONS}`,
            `category-accordion-${QuestionCategoryEnum.PHYSICAL_HEALTH}`,
            `category-accordion-${QuestionCategoryEnum.MENTAL_HEALTH}`,
            `category-accordion-${QuestionCategoryEnum.NUTRITION}`,
        ]);

        // Verify 4/5 normalized to 8/10 for Mental Health
        expect(
            screen.getByTestId(
                `category-score-${QuestionCategoryEnum.MENTAL_HEALTH}`
            )
        ).toHaveTextContent('8/10');
        expect(
            screen.getByTestId(
                `category-score-${QuestionCategoryEnum.ECOLOGY}`
            )
        ).toHaveTextContent('2/10');
    });

    it('starts with all accordions collapsed, expands clicked category, and collapses previously open category when another is clicked', () => {
        const store = createTestStore({
            activePoll: mockPoll,
            questions: createTestQuestions(),
        });

        renderDiagnosticResults(store);

        const ecologyHeader = screen.getByTestId(
            `category-accordion-header-${QuestionCategoryEnum.ECOLOGY}`
        );
        const mentalHealthHeader = screen.getByTestId(
            `category-accordion-header-${QuestionCategoryEnum.MENTAL_HEALTH}`
        );

        // All collapsed initially
        expect(ecologyHeader).toHaveAttribute('aria-expanded', 'false');
        expect(mentalHealthHeader).toHaveAttribute('aria-expanded', 'false');
        expect(
            screen.queryByText('FEEDBACK MESSAGES')
        ).not.toBeInTheDocument();

        // Click Ecology (score 2/10 -> LOW competence feedback)
        fireEvent.click(ecologyHeader);
        expect(ecologyHeader).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('FEEDBACK MESSAGES')).toBeInTheDocument();
        expect(
            screen.getByText(
                /Your responses suggest that ecology and green living may be new for you/i
            )
        ).toBeInTheDocument();

        // Click Mental Health (score 8/10 -> GOOD competence feedback) -> Ecology closes, Mental Health opens
        fireEvent.click(mentalHealthHeader);
        expect(ecologyHeader).toHaveAttribute('aria-expanded', 'false');
        expect(mentalHealthHeader).toHaveAttribute('aria-expanded', 'true');
        expect(
            screen.queryByText(
                /Your responses suggest that ecology and green living may be new for you/i
            )
        ).not.toBeInTheDocument();
        expect(
            screen.getByText(
                /Your responses indicate a strong and well-developed understanding of mental health/i
            )
        ).toBeInTheDocument();
    });

    it('navigates to /materials with selected category state when "Go to materials" is clicked', () => {
        const store = createTestStore({
            activePoll: mockPoll,
            questions: createTestQuestions(),
        });

        renderDiagnosticResults(store);

        fireEvent.click(
            screen.getByTestId(
                `category-accordion-header-${QuestionCategoryEnum.ECOLOGY}`
            )
        );

        const goToMaterialsBtn = screen.getByTestId(
            `go-to-materials-${QuestionCategoryEnum.ECOLOGY}`
        );
        fireEvent.click(goToMaterialsBtn);

        expect(mockedNavigate).toHaveBeenCalledWith(
            constantsUrls.Main.materials,
            {
                state: {
                    category: QuestionCategoryEnum.ECOLOGY,
                    categoryKey: 'ecology',
                },
            }
        );
    });

    it('navigates to home page "/" when "Close and return to the home page" is clicked', () => {
        const store = createTestStore({
            activePoll: mockPoll,
            questions: createTestQuestions(),
        });

        renderDiagnosticResults(store);

        const closeBtn = screen.getByTestId('diagnostic-results-close-btn');
        fireEvent.click(closeBtn);

        expect(mockedNavigate).toHaveBeenCalledWith(
            constantsUrls.LandingPage.main
        );
    });

    it('renders NotFound (404) screen when poll error is present in state (e.g. not found on backend)', () => {
        const store = createTestStore({
            activePoll: null,
            error: 'PLAYER_POLL_NOT_FOUND',
        });

        renderDiagnosticResults(store, 'non-existent-poll-id');

        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
        expect(screen.getByTestId('not-found-code')).toHaveTextContent('404');
        expect(screen.getByTestId('not-found-title')).toBeInTheDocument();
    });

    it('renders NotFound (404) screen when activePoll belongs to another user', () => {
        const pollOfAnotherSenior: IPlayerPoll = {
            ...mockPoll,
            playerId: 'user-senior-other',
            mentorId: undefined,
        };
        const store = createTestStore(
            { activePoll: pollOfAnotherSenior },
            {
                currentUser: {
                    _id: 'user-logged-in',
                    role: 'SENIOR',
                    email: 'senior@example.com',
                },
            }
        );

        renderDiagnosticResults(store, 'poll-abc-123');

        expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
        expect(screen.getByTestId('not-found-code')).toHaveTextContent('404');
    });
});
