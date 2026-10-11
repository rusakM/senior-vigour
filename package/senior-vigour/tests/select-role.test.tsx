import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import SelectRole from '../src/pages/select-role/select-role';
import { UserRoleEnum } from '../src/types/user';
import { UserActionTypes } from '../src/redux/user/user.types';
import { editUserFailure, editUserSuccess } from '../src/redux/user/user.actions';

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
let mockLocationState: any = null;

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router-dom')>();
    return {
        ...actual,
        useNavigate: () => mockedNavigate,
        useLocation: () => ({
            state: mockLocationState,
            pathname: '/select-role',
            search: '',
            hash: '',
            key: 'default',
        }),
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

describe('SelectRole Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockLocationState = null;
    });

    it('renders Header, illustration, title, question, YES/NO options, and action buttons', () => {
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole />
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

        // Title & Question
        expect(within(main).getByRole('heading', { name: /tell us more about yourself!/i })).toBeInTheDocument();
        expect(within(main).getByText(/are you an educator\?/i)).toBeInTheDocument();

        // YES and NO options
        expect(within(main).getByRole('radio', { name: /^yes$/i })).toBeInTheDocument();
        expect(within(main).getByRole('radio', { name: /^no$/i })).toBeInTheDocument();

        // Action buttons
        expect(within(main).getByRole('button', { name: /^confirm$/i })).toBeInTheDocument();
        expect(within(main).getByRole('button', { name: /^back$/i })).toBeInTheDocument();
    });

    it('navigates to landing page when Back button is clicked', () => {
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const backBtn = within(main).getByRole('button', { name: /^back$/i });
        fireEvent.click(backBtn);

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('shows validation error when confirming without selecting a role', () => {
        const testStore = createTestStore();
        const dispatchSpy = vi.spyOn(testStore, 'dispatch');
        const onSelectRoleMock = vi.fn();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole onSelectRole={onSelectRoleMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(within(main).getByRole('alert')).toHaveTextContent('Please select an option to proceed.');
        expect(onSelectRoleMock).not.toHaveBeenCalled();
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('clears validation error when user selects a role', () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(within(main).getByRole('alert')).toBeInTheDocument();

        const yesOption = within(main).getByRole('radio', { name: /^yes$/i });
        fireEvent.click(yesOption);

        expect(within(main).queryByRole('alert')).not.toBeInTheDocument();
    });

    it('allows selecting YES (MENTOR), submits role, and dispatches editUserStart', () => {
        const testStore = createTestStore();
        const dispatchSpy = vi.spyOn(testStore, 'dispatch');
        const onSelectRoleMock = vi.fn();

        mockLocationState = {
            firstName: 'Jan',
            lastName: 'Kowalski',
            countryCode: 'PL',
        };

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole onSelectRole={onSelectRoleMock} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const yesOption = within(main).getByRole('radio', { name: /^yes$/i });
        fireEvent.click(yesOption);

        expect(yesOption).toHaveAttribute('aria-checked', 'true');

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(onSelectRoleMock).toHaveBeenCalledWith(UserRoleEnum.MENTOR);
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: UserActionTypes.EDIT_USER_START,
            payload: {
                firstName: 'Jan',
                lastName: 'Kowalski',
                countryCode: 'PL',
                role: UserRoleEnum.MENTOR,
                confirmed: true,
            },
        });
    });

    it('allows selecting NO (SENIOR), submits role, and dispatches editUserStart', () => {
        const testStore = createTestStore();
        const dispatchSpy = vi.spyOn(testStore, 'dispatch');
        const onSelectRoleMock = vi.fn();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole
                        initialFirstName="Anna"
                        initialLastName="Nowak"
                        initialCountryCode="DE"
                        onSelectRole={onSelectRoleMock}
                    />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const noOption = within(main).getByRole('radio', { name: /^no$/i });
        fireEvent.click(noOption);

        expect(noOption).toHaveAttribute('aria-checked', 'true');

        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        fireEvent.click(confirmBtn);

        expect(onSelectRoleMock).toHaveBeenCalledWith(UserRoleEnum.SENIOR);
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: UserActionTypes.EDIT_USER_START,
            payload: {
                firstName: 'Anna',
                lastName: 'Nowak',
                countryCode: 'DE',
                role: UserRoleEnum.SENIOR,
                confirmed: true,
            },
        });
    });

    it('preselects role when initialRole prop is provided', () => {
        const testStore = createTestStore();
        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole initialRole={UserRoleEnum.MENTOR} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const yesOption = within(main).getByRole('radio', { name: /^yes$/i });
        const noOption = within(main).getByRole('radio', { name: /^no$/i });

        expect(yesOption).toHaveAttribute('aria-checked', 'true');
        expect(noOption).toHaveAttribute('aria-checked', 'false');
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
                    <SelectRole />
                </BrowserRouter>
            </Provider>
        );

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });

    it('redirects to landing page when currentUser updates to complete after editUserSuccess', async () => {
        const testStore = createTestStore({
            currentUser: {
                _id: '123',
                email: 'test@example.com',
            },
        });

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole />
                </BrowserRouter>
            </Provider>
        );

        fireEvent.click(screen.getByRole('radio', { name: /^yes$/i }));

        act(() => {
            testStore.dispatch(
                editUserSuccess({
                    _id: '123',
                    email: 'test@example.com',
                    firstName: 'Jan',
                    lastName: 'Kowalski',
                    confirmed: true,
                    role: UserRoleEnum.MENTOR,
                })
            );
        });

        await waitFor(() => {
            expect(mockedNavigate).toHaveBeenCalledWith('/');
        });
    });

    it('displays error and stays on page when edit fails', async () => {
        const testStore = createTestStore();

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole initialRole={UserRoleEnum.MENTOR} />
                </BrowserRouter>
            </Provider>
        );

        act(() => {
            testStore.dispatch(editUserFailure('Server error updating profile'));
        });

        const main = screen.getByRole('main');
        await waitFor(() => {
            expect(within(main).getByRole('alert')).toBeInTheDocument();
            expect(within(main).getByText('Server error updating profile')).toBeInTheDocument();
        });
        expect(mockedNavigate).not.toHaveBeenCalledWith('/');
    });

    it('disables buttons when isLoadingData is true', () => {
        const testStore = createTestStore({
            isFetching: true,
        });

        render(
            <Provider store={testStore}>
                <BrowserRouter>
                    <SelectRole initialRole={UserRoleEnum.MENTOR} />
                </BrowserRouter>
            </Provider>
        );

        const main = screen.getByRole('main');
        const confirmBtn = within(main).getByRole('button', { name: /^confirm$/i });
        const backBtn = within(main).getByRole('button', { name: /^back$/i });
        const yesOption = within(main).getByRole('radio', { name: /^yes$/i });
        const noOption = within(main).getByRole('radio', { name: /^no$/i });

        expect(confirmBtn).toBeDisabled();
        expect(backBtn).toBeDisabled();
        expect(yesOption).toBeDisabled();
        expect(noOption).toBeDisabled();
    });
});
