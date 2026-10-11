import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
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

describe('FillRegisterData Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders Header, illustration, title, First Name, Last Name, Country select, and action buttons', () => {
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
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

    it('redirects to landing page if currentUser profile is already complete', () => {
        const testStore = createTestStore({
            currentUser: {
                _id: '123',
                email: 'test@example.com',
                firstName: 'Jan',
                lastName: 'Kowalski',
                confirmed: true,
            },
        });

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <FillRegisterData />
                </BrowserRouter>
            </Provider>
        );

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to landing page when Back button is clicked', () => {
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
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
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
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

    it('shows validation error when attempting to submit with missing fields', () => {
        const testStore = createTestStore();
        const onSubmitMock = vi.fn();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <FillRegisterData onSubmitData={onSubmitMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(within(main).getByRole('alert')).toHaveTextContent('Please fill in all fields to proceed.');
        expect(onSubmitMock).not.toHaveBeenCalled();
        expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('clears validation error when user begins typing', () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <FillRegisterData />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(within(main).getByRole('alert')).toBeInTheDocument();

        const firstNameInput = within(main).getByPlaceholderText(/first name/i);
        fireEvent.change(firstNameInput, { target: { value: 'Anna' } });

        expect(within(main).queryByRole('alert')).not.toBeInTheDocument();
    });

    it('validates and navigates to /select-role with form state without making API requests', () => {
        const testStore = createTestStore();
        const dispatchSpy = vi.spyOn(testStore, 'dispatch');
        const onSubmitMock = vi.fn();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <FillRegisterData onSubmitData={onSubmitMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const firstNameInput = within(main).getByPlaceholderText(/first name/i);
        const lastNameInput = within(main).getByPlaceholderText(/last name/i);
        const countryInput = within(main).getByPlaceholderText(/country/i);

        fireEvent.change(firstNameInput, { target: { value: 'Jan' } });
        fireEvent.change(lastNameInput, { target: { value: 'Kowalski' } });

        fireEvent.click(countryInput);
        const polandOption = within(main).getByText('Poland');
        fireEvent.click(polandOption);

        expect(countryInput).toHaveValue('Poland');

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(onSubmitMock).toHaveBeenCalledWith({
            firstName: 'Jan',
            lastName: 'Kowalski',
            country: 'PL',
        });
        expect(mockedNavigate).toHaveBeenCalledWith('/select-role', {
            state: {
                firstName: 'Jan',
                lastName: 'Kowalski',
                countryCode: 'PL',
            },
        });
        // Verifying no actions were dispatched
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('pre-populates initial fields if passed via props', () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <FillRegisterData
                        initialFirstName="Maria"
                        initialLastName="Nowak"
                        initialCountry="FR"
                    />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        expect(within(main).getByPlaceholderText(/first name/i)).toHaveValue('Maria');
        expect(within(main).getByPlaceholderText(/last name/i)).toHaveValue('Nowak');
        expect(within(main).getByPlaceholderText(/country/i)).toHaveValue('France');
    });
});
