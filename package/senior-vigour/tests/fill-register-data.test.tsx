import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import FillRegisterData from '../src/pages/fill-register-data/fill-register-data';

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

describe('FillRegisterData Page Component', () => {
    it('renders Header, illustration, title, First Name, Last Name, Country select, and action buttons', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <FillRegisterData />
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
        expect(within(main).getByRole('heading', { name: /tell us more about yourself!/i })).toBeInTheDocument();

        // Inputs
        expect(within(main).getByPlaceholderText(/first name/i)).toBeInTheDocument();
        expect(within(main).getByPlaceholderText(/last name/i)).toBeInTheDocument();
        expect(within(main).getByPlaceholderText(/country/i)).toBeInTheDocument();

        // Action buttons
        expect(within(main).getByRole('button', { name: /^confirm$/i })).toBeInTheDocument();
        expect(within(main).getByRole('button', { name: /^back$/i })).toBeInTheDocument();
    });

    it('navigates to landing page when Back button is clicked', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <FillRegisterData />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const backBtn = within(main).getByRole('button', { name: /^back$/i });
        fireEvent.click(backBtn);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('allows typing into first name and last name inputs', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <FillRegisterData />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const firstNameInput = within(main).getByPlaceholderText(/first name/i);
        const lastNameInput = within(main).getByPlaceholderText(/last name/i);

        fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
        fireEvent.change(lastNameInput, { target: { value: 'Kowalski' } });

        expect(firstNameInput).toHaveValue('Jan');
        expect(lastNameInput).toHaveValue('Kowalski');
    });

    it('allows selecting country from dropdown and submits form', () => {
        const onSubmitMock = vi.fn();
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <FillRegisterData onSubmitData={onSubmitMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const countryInput = within(main).getByPlaceholderText(/country/i);
        fireEvent.click(countryInput);

        const polandOption = within(main).getByText('Poland');
        fireEvent.click(polandOption);

        expect(countryInput).toHaveValue('Poland');

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(onSubmitMock).toHaveBeenCalledWith(expect.objectContaining({
            country: 'PL',
        }));
    });
});
