import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import Confirm from '../src/pages/confirm/confirm';

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

describe('Confirm Page Component', () => {
    it('renders Header, illustration, title, description, code input, resend button, error message, and action buttons', () => {
        render(
            <Provider store={store}>
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

        // Resend Code button/link
        expect(within(main).getByRole('button', { name: /resend code/i })).toBeInTheDocument();

        // Error message (from mockup)
        expect(within(main).getByText(/invalid verification code or account does not exist/i)).toBeInTheDocument();

        // Action buttons
        expect(within(main).getByRole('button', { name: /^confirm$/i })).toBeInTheDocument();
        expect(within(main).getByRole('button', { name: /^back$/i })).toBeInTheDocument();
    });

    it('navigates to landing page when Back button is clicked', () => {
        render(
            <Provider store={store}>
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
        render(
            <Provider store={store}>
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

    it('submits form without crash', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <Confirm />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const codeInput = within(main).getByPlaceholderText(/enter the code from your email/i);
        fireEvent.change(codeInput, { target: { value: '987654' } });

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);
    });

    it('calls onResend callback when Resend Code is clicked', () => {
        const onResendMock = vi.fn();
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <Confirm onResend={onResendMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const resendBtn = within(main).getByRole('button', { name: /resend code/i });
        fireEvent.click(resendBtn);

        expect(onResendMock).toHaveBeenCalledTimes(1);
    });

    it('does not render error message when initialError is null', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <Confirm initialError={null} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        expect(within(main).queryByRole('alert')).not.toBeInTheDocument();
    });
});
