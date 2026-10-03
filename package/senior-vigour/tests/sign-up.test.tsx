import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import SignUp from '../src/pages/sign-up/sign-up';

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

describe('SignUp Page Component', () => {
    it('renders Header, illustration, title, email input, signin link, and action buttons', () => {
        render(
            <Provider store={store}>
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
        render(
            <Provider store={store}>
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

    it('allows typing into email input and handles form submit', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <SignUp />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const emailInput = within(main).getByPlaceholderText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
        expect(emailInput).toHaveValue('newuser@example.com');

        const signUpBtn = within(main).getByRole('button', { name: /^sign up$/i });
        fireEvent.click(signUpBtn);
    });

    it('renders terms checkbox with clickable link and allows toggling', () => {
        render(
            <Provider store={store}>
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
});
