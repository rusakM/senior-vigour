import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import { store } from '../src/redux/store';
import SignIn from '../src/pages/sign-in/sign-in';
import { checkEmailFailure, checkEmailSuccess, setCurrentUser } from '../src/redux/user/user.actions';
import { ERRORS_ENUM } from '../src/api/user.api';

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (key: string, defaultValue?: string) => defaultValue || key,
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

describe('SignIn Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Header, illustration, title, email input, signup link, and action buttons', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SignIn />
                </BrowserRouter>
            </Provider>
        );

        // Header logo
        expect(screen.getByAltText('Senior Vigour Logo')).toBeInTheDocument();

        // Background shapes
        expect(screen.getByTestId('background-shapes')).toBeInTheDocument();

        const main = screen.getByRole('main');

        // Illustration
        expect(screen.getByRole('presentation')).toBeInTheDocument();

        // Title
        expect(within(main).getByRole('heading', { name: /sign in/i })).toBeInTheDocument();

        // Email input
        expect(within(main).getByPlaceholderText(/email/i)).toBeInTheDocument();

        // Sign up prompt and link
        expect(within(main).getByText(/don't have an account\?/i)).toBeInTheDocument();
        expect(within(main).getByRole('link', { name: /sign up/i })).toBeInTheDocument();

        // Buttons inside form
        expect(within(main).getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
        expect(within(main).getByRole('button', { name: /^back$/i })).toBeInTheDocument();
    });

    it('navigates to landing page when Back button is clicked', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SignIn />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const backBtn = within(main).getByRole('button', { name: /^back$/i });
        fireEvent.click(backBtn);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('allows typing into email input and dispatches checkEmailStart on submit', () => {
        const testStore = configureStore({ reducer: rootReducer });
        const onSubmitMock = vi.fn();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignIn onSubmitEmail={onSubmitMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        expect(emailInput).toHaveValue('user@example.com');

        const logInBtn = within(main).getByRole('button', { name: /^log in$/i });
        fireEvent.click(logInBtn);

        expect(onSubmitMock).toHaveBeenCalledWith('user@example.com');
        expect(testStore.getState().user.signInEmail).toBe('user@example.com');
        expect(testStore.getState().user.isFetching).toBe(true);
    });

    it('navigates to /signup when checkEmail fails with USER_WITH_EMAIL_NOT_FOUND (404)', async () => {
        const testStore = configureStore({ reducer: rootReducer });

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignIn />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'unknown@example.com' } });

        const logInBtn = within(main).getByRole('button', { name: /^log in$/i });
        fireEvent.click(logInBtn);

        // Simulate saga failure with USER_WITH_EMAIL_NOT_FOUND
        testStore.dispatch(checkEmailFailure(ERRORS_ENUM.USER_WITH_EMAIL_NOT_FOUND));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/signup');
        });
    });

    it('navigates to /confirm when checkEmail succeeds (200)', async () => {
        const testStore = configureStore({ reducer: rootReducer });

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignIn />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });

        const logInBtn = within(main).getByRole('button', { name: /^log in$/i });
        fireEvent.click(logInBtn);

        // Simulate saga success with 200 response
        testStore.dispatch(checkEmailSuccess('existing@example.com'));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/confirm');
        });
    });

    it('redirects to landing page if user is already logged in', () => {
        const loggedInStore = configureStore({
            reducer: rootReducer,
            preloadedState: {
                user: {
                    currentUser: { _id: '123', email: 'logged@example.com' },
                    isFetching: false,
                    signInEmail: '',
                    userError: '',
                },
            },
        });

        render(
            <Provider store={loggedInStore}>
                <BrowserRouter>
                    <SignIn />
                </BrowserRouter>
            </Provider>
        );

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
});
