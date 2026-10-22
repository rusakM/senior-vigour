import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import rootReducer from '../src/redux/root-reducer';
import DiagnosisResults from '../src/pages/diagnosis-results/diagnosis-results';
import { INITIAL_STATE as POLL_INITIAL_STATE } from '../src/redux/poll/poll.reducer';
import { PollActionTypes, type IPollState } from '../src/redux/poll/poll.types';
import { type IPlayerPoll, PollStatusEnum } from '../src/types/poll';
import { constantsUrls } from '../src/helpers/constants';
import { formatPollDate } from '../src/pages/diagnosis-results/diagnosis-results.utils';

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

const mockPolls: IPlayerPoll[] = [
    {
        _id: 'poll-older',
        playerId: 'user-1',
        firstName: 'Emma',
        lastName: 'Johnson',
        status: PollStatusEnum.FINISHED,
        score: 14,
        createdAt: '2024-05-12T14:32:00.000Z',
    },
    {
        _id: 'poll-newer',
        playerId: 'user-1',
        firstName: 'Michael',
        lastName: 'Brown',
        status: PollStatusEnum.FINISHED,
        score: 18,
        createdAt: '2024-05-15T09:15:00.000Z',
    },
    {
        _id: 'poll-unfinished',
        playerId: 'user-1',
        firstName: 'Unfinished',
        lastName: 'Senior',
        status: PollStatusEnum.STARTED,
        score: 2,
        createdAt: '2024-05-16T10:00:00.000Z',
    },
];

const createTestStore = (pollOverrides: Partial<IPollState> = {}) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            poll: {
                ...POLL_INITIAL_STATE,
                ...pollOverrides,
            },
        },
    });
};

const renderDiagnosisResults = (store: ReturnType<typeof createTestStore>) => {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticResults]}>
                <Routes>
                    <Route
                        path={constantsUrls.Main.diagnosticResults}
                        element={<DiagnosisResults />}
                    />
                </Routes>
            </MemoryRouter>
        </Provider>
    );
};

describe('DiagnosisResults List Screen (/diagnostic-results)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders title, subtitle and dispatches fetchPlayerPollsStart on mount', () => {
        const store = createTestStore({ playerPolls: [] });
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        renderDiagnosisResults(store);

        expect(
            screen.getByRole('heading', { level: 1, name: 'Diagnosis results' })
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'Here you will find all saved diagnostic results along with recommendations'
            )
        ).toBeInTheDocument();

        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                type: PollActionTypes.FETCH_PLAYER_POLLS_START,
            })
        );
    });

    it('displays only FINISHED polls sorted descending by createdAt with formatted dates', () => {
        const store = createTestStore({ playerPolls: mockPolls });

        renderDiagnosisResults(store);

        const cards = screen.getAllByTestId('diagnosis-result-card');
        expect(cards).toHaveLength(2); // Only finished polls, unfinished is excluded

        // First item should be the newer poll (Michael Brown)
        expect(cards[0]).toHaveTextContent('Michael Brown');
        expect(cards[0]).toHaveTextContent(formatPollDate(mockPolls[1].createdAt));

        // Second item should be the older poll (Emma Johnson)
        expect(cards[1]).toHaveTextContent('Emma Johnson');
        expect(cards[1]).toHaveTextContent(formatPollDate(mockPolls[0].createdAt));

        // Unfinished poll should NOT be rendered
        expect(screen.queryByText('Unfinished Senior')).not.toBeInTheDocument();
    });

    it('navigates to pollResults when a result card is clicked', () => {
        const store = createTestStore({ playerPolls: mockPolls });

        renderDiagnosisResults(store);

        const cards = screen.getAllByTestId('diagnosis-result-card');
        fireEvent.click(cards[0]);

        expect(mockedNavigate).toHaveBeenCalledWith(
            constantsUrls.Main.pollResults.replace(':playerPollId', 'poll-newer')
        );
    });

    it('displays empty state when there are no finished polls and navigates to diagnostic-test on CTA click', () => {
        const store = createTestStore({
            playerPolls: [],
            isFetchingPlayerPolls: false,
        });

        renderDiagnosisResults(store);

        expect(screen.getByTestId('diagnosis-empty-results')).toBeInTheDocument();
        expect(
            screen.getByText('No diagnostic results yet')
        ).toBeInTheDocument();

        const startBtn = screen.getByTestId('start-diagnostic-test-btn');
        fireEvent.click(startBtn);

        expect(mockedNavigate).toHaveBeenCalledWith(constantsUrls.Main.diagnosticTest);
    });
});
