import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import SignUp from '../src/pages/sign-up/sign-up';
import { signUpSuccess, signUpFailure } from '../src/redux/user/user.actions';
import { UserActionTypes } from '../src/redux/user/user.types';

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

const createTestStore = (overrides = {}) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            user: {
                currentUser: null,
                isFetching: false,
                signInEmail: '',
                userError: '',
                ...overrides,
            },
        },
    });
};

describe('SignUp Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Header, illustration, title, email input, signin link, and action buttons', () => {
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignUp />
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
        expect(within(main).getByRole('heading', { name: /sign up/i })).toBeInTheDocument();

        // Email input
        expect(within(main).getByPlaceholderText(/email/i)).toBeInTheDocument();

        // Sign in prompt and link
        expect(within(main).getByText(/already have an account\?/i)).toBeInTheDocument();
        expect(within(main).getByRole('link', { name: /log in/i })).toBeInTheDocument();

        // Buttons inside form
        expect(within(main).getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();
        expect(within(main).getByRole('button', { name: /^back$/i })).toBeInTheDocument();
    });

    it('navigates to landing page when Back button is clicked', () => {
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const backBtn = within(main).getByRole('button', { name: /^back$/i });
        fireEvent.click(backBtn);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('renders terms checkbox with clickable link and allows toggling', () => {
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const checkbox = within(main).getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();

        expect(within(main).getByText(/i have read and accept the/i)).toBeInTheDocument();
        const termsLink = within(main).getByRole('link', { name: /terms and condition/i });
        expect(termsLink).toBeInTheDocument();
        expect(termsLink).toHaveAttribute('href', '/cdn/assets/SeniorVigour_Terms_of_Service.pdf');

        fireEvent.click(checkbox);
        expect(checkbox).toBeChecked();
    });

    it('requires terms checkbox before submitting', () => {
        const testStore = createTestStore();
        const dispatchSpy = vi.spyOn(testStore, 'dispatch');

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });

        const signUpBtn = within(main).getByRole('button', { name: /^sign up$/i });
        fireEvent.click(signUpBtn);

        // Validation error appears and signUpStart is NOT dispatched
        expect(within(main).getByRole('alert')).toHaveTextContent(/please accept the terms and conditions/i);
        expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({
            type: UserActionTypes.SIGN_UP_START,
        }));
    });

    it('dispatches signUpStart when email is entered and terms are accepted', () => {
        const testStore = createTestStore();
        const dispatchSpy = vi.spyOn(testStore, 'dispatch');
        const onSubmitMock = vi.fn();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignUp onSubmitEmail={onSubmitMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });

        const checkbox = within(main).getByRole('checkbox');
        fireEvent.click(checkbox);

        const signUpBtn = within(main).getByRole('button', { name: /^sign up$/i });
        fireEvent.click(signUpBtn);

        expect(onSubmitMock).toHaveBeenCalledWith('newuser@example.com');
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: UserActionTypes.SIGN_UP_START,
            payload: { email: 'newuser@example.com' },
        });
    });

    it('navigates to /confirm when signUp succeeds (200)', async () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });

        const checkbox = within(main).getByRole('checkbox');
        fireEvent.click(checkbox);

        const signUpBtn = within(main).getByRole('button', { name: /^sign up$/i });
        fireEvent.click(signUpBtn);

        // Simulate successful register response (200)
        testStore.dispatch(signUpSuccess('newuser@example.com'));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/confirm');
        });
    });

    it('displays error message when signUp fails', async () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });

        const checkbox = within(main).getByRole('checkbox');
        fireEvent.click(checkbox);

        const signUpBtn = within(main).getByRole('button', { name: /^sign up$/i });
        fireEvent.click(signUpBtn);

        // Simulate failure
        testStore.dispatch(signUpFailure('Account already exists'));

        await waitFor(() => {
            expect(within(main).getByRole('alert')).toHaveTextContent('Account already exists');
        });
        expect(mockedNavigate).not.toHaveBeenCalledWith('/confirm');
    });

    it('redirects to landing page if user is already logged in', () => {
        const loggedInStore = createTestStore({
            currentUser: { _id: '123', email: 'logged@example.com' },
        });

        render(
            <Provider store={loggedInStore}>
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            </Provider>
        );

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
});
