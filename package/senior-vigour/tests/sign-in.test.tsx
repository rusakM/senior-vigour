import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import SignIn from '../src/pages/sign-in/sign-in';

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

    it('allows typing into email input and handles form submit', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SignIn />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        expect(emailInput).toHaveValue('user@example.com');

        const logInBtn = within(main).getByRole('button', { name: /^log in$/i });
        fireEvent.click(logInBtn);
        // Form submitted without reload/error
    });
});
