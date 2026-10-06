import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import Confirm from '../src/pages/confirm/confirm';
import {
    verifyCodeFailure,
    setCurrentUser,
} from '../src/redux/user/user.actions';
import { UserActionTypes } from '../src/redux/user/user.types';
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

const createTestStore = (overrides = {}) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            user: {
                currentUser: null,
                isFetching: false,
                signInEmail: 'test@example.com',
                userError: '',
                ...overrides,
            },
        },
    });
};

describe('Confirm Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('redirects to landing page if accessed without email', () => {
        const storeWithoutEmail = configureStore({
            reducer: rootReducer,
            preloadedState: {
                user: {
                    currentUser: null,
                    isFetching: false,
                    signInEmail: '',
                    userError: '',
                },
            },
        });

        render(
            <Provider store={storeWithoutEmail}>
                <BrowserRouter>
                    <Confirm />
                </BrowserRouter>
            </Provider>
        );

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('redirects to landing page if user is already logged in', () => {
        const storeWithLoggedInUser = configureStore({
            reducer: rootReducer,
            preloadedState: {
                user: {
                    currentUser: { _id: '123', email: 'test@example.com' },
                    isFetching: false,
                    signInEmail: 'test@example.com',
                    userError: '',
                },
            },
        });

        render(
            <Provider store={storeWithLoggedInUser}>
                <BrowserRouter>
                    <Confirm />
                </BrowserRouter>
            </Provider>
        );

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('renders Header, illustration, title, description, code input, resend button, and action buttons', () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <Confirm />
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
        expect(within(main).getByRole('heading', { name: /enter verification code/i })).toBeInTheDocument();

        // Description lines
        expect(within(main).getByText(/we've sent a verification code to your email address/i)).toBeInTheDocument();
        expect(within(main).getByText(/check your email, open the message, and enter the verification code below/i)).toBeInTheDocument();

        // Code input
        expect(within(main).getByPlaceholderText(/enter the code from your email/i)).toBeInTheDocument();

        // Resend Code button
        expect(within(main).getByRole('button', { name: /resend code/i })).toBeInTheDocument();

        // No error initially
        expect(within(main).queryByRole('alert')).not.toBeInTheDocument();

        // Action buttons
        expect(within(main).getByRole('button', { name: /^confirm$/i })).toBeInTheDocument();
        expect(within(main).getByRole('button', { name: /^back$/i })).toBeInTheDocument();
    });

    it('navigates to landing page when Back button is clicked', () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <Confirm />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const backBtn = within(main).getByRole('button', { name: /^back$/i });
        fireEvent.click(backBtn);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('allows typing code into input', () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <Confirm />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const codeInput = within(main).getByPlaceholderText(/enter the code from your email/i);
        fireEvent.change(codeInput, { target: { value: '123456' } });
        expect(codeInput).toHaveValue('123456');
    });

    it('submits form and dispatches verifyCodeStart', () => {
        const testStore = createTestStore();
        const dispatchSpy = vi.spyOn(testStore, 'dispatch');
        const onConfirmMock = vi.fn();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <Confirm onConfirm={onConfirmMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const codeInput = within(main).getByPlaceholderText(/enter the code from your email/i);
        fireEvent.change(codeInput, { target: { value: '987654' } });

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(onConfirmMock).toHaveBeenCalledWith('987654');
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: UserActionTypes.VERIFY_CODE_START,
            payload: { email: 'test@example.com', verificationCode: '987654' },
        });
    });

    it('displays error and stays on page when verification fails', async () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <Confirm />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const codeInput = within(main).getByPlaceholderText(/enter the code from your email/i);
        fireEvent.change(codeInput, { target: { value: '000000' } });

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        // Simulate verification failure
        testStore.dispatch(verifyCodeFailure(ERRORS_ENUM.INCORRECT_VERIFICATION_CODE));

        // Error message appears and user stays on the page
        await waitFor(() => {
            expect(within(main).getByRole('alert')).toBeInTheDocument();
            expect(within(main).getByText(/invalid verification code or account does not exist/i)).toBeInTheDocument();
        });
        expect(mockedNavigate).not.toHaveBeenCalledWith('/');
    });

    it('navigates to landing page when verification succeeds (currentUser is set)', async () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <Confirm />
                </BrowserRouter>
            </Provider>
        );

        // Simulate successful verification login
        testStore.dispatch(setCurrentUser({ _id: '123', email: 'test@example.com' }));

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('calls onResend callback and dispatches checkEmailStart when Resend Code is clicked', () => {
        const testStore = createTestStore();
        const dispatchSpy = vi.spyOn(testStore, 'dispatch');
        const onResendMock = vi.fn();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <Confirm onResend={onResendMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const resendBtn = within(main).getByRole('button', { name: /resend code/i });
        fireEvent.click(resendBtn);

        expect(onResendMock).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: UserActionTypes.CHECK_EMAIL_START,
            payload: 'test@example.com',
        });
    });

    it('renders initialError if provided', () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <Confirm initialError="Custom verification error message" />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        expect(within(main).getByRole('alert')).toHaveTextContent('Custom verification error message');
    });
});
