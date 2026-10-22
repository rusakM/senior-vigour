import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

import rootReducer from '../src/redux/root-reducer';
import EditProfile from '../src/pages/edit-profile/edit-profile';
import { UserRoleEnum, type IUser } from '../src/types/user';
import { UserActionTypes } from '../src/redux/user/user.types';
import { constantsUrls } from '../src/helpers/constants';

vi.mock('../src/helpers/responsiveContainers', () => ({
    useMobile: () => false,
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

const mockUser: IUser = {
    _id: 'user-123',
    email: 'jan.kowalski@example.com',
    firstName: 'Jan',
    lastName: 'Kowalski',
    countryCode: 'PL',
    role: UserRoleEnum.SENIOR,
    confirmed: true,
    isEnabled: true,
};

const createTestStore = (currentUser: IUser | null = mockUser) => {
    return configureStore({
        reducer: rootReducer,
        preloadedState: {
            user: {
                currentUser,
                isFetching: false,
                signInEmail: '',
                userError: '',
            },
        },
    });
};

describe('EditProfile Page Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('redirects unauthenticated user to /signin', () => {
        const store = createTestStore(null);

        const { container } = render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[constantsUrls.Main.myProfile]}>
                    <EditProfile />
                </MemoryRouter>
            </Provider>
        );

        expect(mockedNavigate).toHaveBeenCalledWith(
            constantsUrls.LandingPage.signIn,
            { replace: true }
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('renders First Name, Last Name, Email, Country populated from currentUser with all inputs disabled initially and Change button hidden', () => {
        const store = createTestStore(mockUser);

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[constantsUrls.Main.myProfile]}>
                    <EditProfile />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByRole('heading', { name: 'Your Profile' })
        ).toBeInTheDocument();

        const firstNameInput = screen.getByLabelText('First Name') as HTMLInputElement;
        const lastNameInput = screen.getByLabelText('Last Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const countryInput = screen.getByLabelText('Country') as HTMLInputElement;

        expect(firstNameInput.value).toBe('Jan');
        expect(lastNameInput.value).toBe('Kowalski');
        expect(emailInput.value).toBe('jan.kowalski@example.com');
        expect(countryInput.value).toBe('Poland');

        expect(firstNameInput).toBeDisabled();
        expect(lastNameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(countryInput).toBeDisabled();

        // Change button is hidden when Edit Profile toggle is off
        expect(
            screen.queryByTestId('profile-change-button')
        ).not.toBeInTheDocument();
    });

    it('enables First Name, Last Name, and Country (keeping Email disabled) and shows Change button when Edit Profile toggle is switched on', () => {
        const store = createTestStore(mockUser);

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[constantsUrls.Main.myProfile]}>
                    <EditProfile />
                </MemoryRouter>
            </Provider>
        );

        const toggle = screen.getByTestId('edit-profile-toggle');
        expect(toggle).toHaveAttribute('aria-checked', 'false');

        fireEvent.click(toggle);
        expect(toggle).toHaveAttribute('aria-checked', 'true');

        expect(screen.getByLabelText('First Name')).not.toBeDisabled();
        expect(screen.getByLabelText('Last Name')).not.toBeDisabled();
        expect(screen.getByLabelText('Country')).not.toBeDisabled();
        expect(screen.getByLabelText('Email')).toBeDisabled();

        expect(screen.getByTestId('profile-change-button')).toBeInTheDocument();
    });

    it('dispatches editUserStart with updated First Name, Last Name, and Country and exits edit mode when Change is clicked', () => {
        const store = createTestStore(mockUser);
        const dispatchSpy = vi.spyOn(store, 'dispatch');

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[constantsUrls.Main.myProfile]}>
                    <EditProfile />
                </MemoryRouter>
            </Provider>
        );

        fireEvent.click(screen.getByTestId('edit-profile-toggle'));

        const firstNameInput = screen.getByLabelText('First Name');
        const lastNameInput = screen.getByLabelText('Last Name');
        const countryInput = screen.getByLabelText('Country');

        fireEvent.change(firstNameInput, { target: { value: '  Anna  ' } });
        fireEvent.change(lastNameInput, { target: { value: '  Nowak  ' } });

        // Open country dropdown and select Germany (DE)
        fireEvent.click(countryInput);
        fireEvent.click(screen.getByRole('option', { name: 'Germany' }));

        const changeBtn = screen.getByTestId('profile-change-button');
        fireEvent.click(changeBtn);

        expect(dispatchSpy).toHaveBeenCalledWith({
            type: UserActionTypes.EDIT_USER_START,
            payload: {
                firstName: 'Anna',
                lastName: 'Nowak',
                countryCode: 'DE',
            },
        });

        // Edit mode is turned off and Change button disappears
        expect(screen.getByTestId('edit-profile-toggle')).toHaveAttribute(
            'aria-checked',
            'false'
        );
        expect(
            screen.queryByTestId('profile-change-button')
        ).not.toBeInTheDocument();
    });

    it('opens Delete my data modal on DELETE ACCOUNT click, closes on Back, and dispatches disableUserStart + navigates to / on Confirm', () => {
        const store = createTestStore(mockUser);
        const dispatchSpy = vi.spyOn(store, 'dispatch');
        localStorage.setItem('token', 'mock-jwt-token');

        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[constantsUrls.Main.myProfile]}>
                    <EditProfile />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.queryByTestId('delete-account-modal')
        ).not.toBeInTheDocument();

        // Click DELETE ACCOUNT button
        fireEvent.click(screen.getByTestId('delete-account-button'));

        expect(screen.getByTestId('delete-account-modal')).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: 'Delete my data' })
        ).toBeInTheDocument();

        // Click Back button to close modal
        fireEvent.click(screen.getByTestId('cancel-delete-account-button'));
        expect(
            screen.queryByTestId('delete-account-modal')
        ).not.toBeInTheDocument();

        // Re-open modal and click Confirm
        fireEvent.click(screen.getByTestId('delete-account-button'));
        fireEvent.click(screen.getByTestId('confirm-delete-account-button'));

        expect(dispatchSpy).toHaveBeenCalledWith({
            type: UserActionTypes.DISABLE_USER_START,
        });
        expect(localStorage.getItem('token')).toBeNull();
        expect(mockedNavigate).toHaveBeenCalledWith(
            constantsUrls.LandingPage.main
        );
    });
});
