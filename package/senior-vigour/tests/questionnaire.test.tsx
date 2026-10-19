import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import Questionnaire from '../src/pages/questionnaire/questionnaire';
import { UserRoleEnum, type IUser } from '../src/types/user';
import { constantsUrls } from '../src/helpers/constants';

let mockIsMobile = false;

vi.mock('../src/helpers/responsiveContainers', () => ({
    useMobile: () => mockIsMobile,
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

const createTestStore = (currentUser: Partial<IUser> | null = null) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            user: {
                currentUser: currentUser as IUser | null,
                isFetching: false,
                signInEmail: '',
                userError: '',
            },
        },
    });
};

describe('Questionnaire (Self-Assessment) Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsMobile = false;
    });

    describe('Access Control', () => {
        it('redirects unauthenticated user (currentUser === null) to sign-in page', () => {
            const store = createTestStore(null);

            const { container } = render(
                <Provider store={store}>
                    <BrowserRouter>
                        <Questionnaire />
                    </BrowserRouter>
                </Provider>
            );

            expect(mockedNavigate).toHaveBeenCalledWith(constantsUrls.LandingPage.signIn, {
                replace: true,
            });
            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('MENTOR Role Flow (Senior Details Form -> Introduction)', () => {
        const mentorUser: Partial<IUser> = {
            _id: 'user-mentor-1',
            email: 'mentor@example.com',
            firstName: 'Mentor',
            lastName: 'User',
            role: UserRoleEnum.MENTOR,
        };

        it('initially renders Senior Details Form for MENTOR user', () => {
            const store = createTestStore(mentorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            expect(mockedNavigate).not.toHaveBeenCalled();

            expect(
                screen.getByRole('heading', {
                    name: "Enter the senior's details",
                })
            ).toBeInTheDocument();

            expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
        });

        it('shows validation error when submitting empty senior details and clears error on input', () => {
            const store = createTestStore(mentorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
            fireEvent.click(confirmBtn);

            expect(screen.getByRole('alert')).toHaveTextContent(
                'Please fill in all fields to proceed.'
            );

            // Typing clears validation error
            const nameInput = screen.getByPlaceholderText('Name');
            fireEvent.change(nameInput, { target: { value: 'Jan' } });

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();

            // Submitting with only first name still triggers validation error
            fireEvent.click(confirmBtn);
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('navigates to materials page when Back button is clicked on Senior Details Form', () => {
            const store = createTestStore(mentorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            const backBtn = screen.getByRole('button', { name: 'Back' });
            fireEvent.click(backBtn);

            expect(mockedNavigate).toHaveBeenCalledWith(constantsUrls.Main.materials);
        });

        it('transitions to Questionnaire Introduction screen after submitting valid senior details', () => {
            const store = createTestStore(mentorUser);
            const handleSeniorDetailsSubmit = vi.fn();

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire onSubmitSeniorDetails={handleSeniorDetailsSubmit} />
                    </MemoryRouter>
                </Provider>
            );

            fireEvent.change(screen.getByPlaceholderText('Name'), {
                target: { value: '  Anna  ' },
            });
            fireEvent.change(screen.getByPlaceholderText('Last name'), {
                target: { value: '  Kowalska  ' },
            });

            fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

            expect(handleSeniorDetailsSubmit).toHaveBeenCalledWith({
                firstName: 'Anna',
                lastName: 'Kowalska',
            });

            // Now on the Questionnaire Introduction screen
            expect(
                screen.queryByRole('heading', { name: "Enter the senior's details" })
            ).not.toBeInTheDocument();
            expect(
                screen.getByRole('heading', { name: 'Introduction' })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('heading', { name: 'Discover Your Learning Needs' })
            ).toBeInTheDocument();
        });
    });

    describe('SENIOR Role Flow & Questionnaire Introduction Screen', () => {
        const seniorUser: Partial<IUser> = {
            _id: 'user-senior-1',
            email: 'senior@example.com',
            firstName: 'Senior',
            lastName: 'User',
            role: UserRoleEnum.SENIOR,
        };

        it('skips Senior Details Form and directly renders Questionnaire Introduction for SENIOR user', () => {
            const store = createTestStore(seniorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            expect(
                screen.queryByRole('heading', { name: "Enter the senior's details" })
            ).not.toBeInTheDocument();

            // QuestionnaireHeader elements
            expect(
                screen.getByRole('heading', { name: 'Introduction' })
            ).toBeInTheDocument();
            expect(screen.getByTestId('questionnaire-quit-button')).toHaveTextContent(
                'QUIT TEST'
            );
            expect(screen.getByTestId('questionnaire-progress-bar')).toBeInTheDocument();

            // Universal content container & QuestionnaireIntroduction elements
            expect(
                screen.getByTestId('questionnaire-content-container')
            ).toBeInTheDocument();
            expect(
                screen.getByRole('heading', { name: 'Discover Your Learning Needs' })
            ).toBeInTheDocument();
            expect(
                screen.getByText(
                    'Complete the diagnostic test to identify which areas of knowledge may be most relevant to you. Based on your answers, the platform will suggest a suitable educational path.'
                )
            ).toBeInTheDocument();
            expect(
                screen.getByText('60 questions and activities')
            ).toBeInTheDocument();
            expect(
                screen.getByText('6 areas of everyday well-being and development')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Personalized educational path based on your answers')
            ).toBeInTheDocument();
            expect(screen.getByTestId('questionnaire-start-button')).toHaveTextContent(
                'Discover Your Learning Needs'
            );
        });

        it('navigates to materials page when QUIT TEST button in QuestionnaireHeader is clicked', () => {
            const store = createTestStore(seniorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            const quitBtn = screen.getByTestId('questionnaire-quit-button');
            fireEvent.click(quitBtn);

            expect(mockedNavigate).toHaveBeenCalledWith(constantsUrls.Main.materials);
        });

        it('calls onStartTest callback when start button is clicked on Introduction screen', () => {
            const store = createTestStore(seniorUser);
            const handleStartTest = vi.fn();

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire onStartTest={handleStartTest} />
                    </MemoryRouter>
                </Provider>
            );

            const startBtn = screen.getByTestId('questionnaire-start-button');
            fireEvent.click(startBtn);

            expect(handleStartTest).toHaveBeenCalledTimes(1);
        });

        it('handles clicking start button safely when onStartTest callback is not provided', () => {
            const store = createTestStore(seniorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            const startBtn = screen.getByTestId('questionnaire-start-button');
            expect(() => {
                fireEvent.click(startBtn);
            }).not.toThrow();
        });

        it('renders properly in mobile layout mode', () => {
            mockIsMobile = true;
            const store = createTestStore(seniorUser);

            render(
                <Provider store={store}>
                    <MemoryRouter initialEntries={[constantsUrls.Main.diagnosticTest]}>
                        <Questionnaire />
                    </MemoryRouter>
                </Provider>
            );

            expect(
                screen.getByRole('heading', { name: 'Introduction' })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('heading', { name: 'Discover Your Learning Needs' })
            ).toBeInTheDocument();
        });
    });
});
