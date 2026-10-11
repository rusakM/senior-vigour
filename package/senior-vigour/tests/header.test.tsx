import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import Header from '../src/components/header/header';
import { UserRoleEnum } from '../src/types/user';
import { UserActionTypes } from '../src/redux/user/user.types';

let mockIsMobile = false;

vi.mock('../src/helpers/responsiveContainers', () => ({
    useMobile: () => mockIsMobile,
}));

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

const createTestStore = (currentUser = null) => {
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

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsMobile = false;
    });

    describe('Desktop Unauthenticated Header', () => {
        it('renders logo, Materials, Language button, and unified user icon + Log In button', () => {
            const testStore = createTestStore(null);
            render(
                <Provider store={testStore}>
                    <BrowserRouter>
                        <Header />
                    </BrowserRouter>
                </Provider>
            );

            expect(screen.getByAltText('Senior Vigour Logo')).toBeInTheDocument();
            expect(screen.getByText('Materials')).toBeInTheDocument();
            expect(screen.getByAltText('Language')).toBeInTheDocument();

            const loginBtn = screen.getByRole('button', { name: /log in/i });
            expect(loginBtn).toBeInTheDocument();
            fireEvent.click(loginBtn);
            expect(mockedNavigate).toHaveBeenCalledWith('/signin');
        });

        it('opens language dropdown when language button is clicked', () => {
            const testStore = createTestStore(null);
            render(
                <Provider store={testStore}>
                    <BrowserRouter>
                        <Header />
                    </BrowserRouter>
                </Provider>
            );

            const langBtn = screen.getByAltText('Language');
            fireEvent.click(langBtn);

            expect(screen.getByText('Polski')).toBeInTheDocument();
            expect(screen.getByText('English')).toBeInTheDocument();
        });
    });

    describe('Desktop Authenticated Header', () => {
        it('renders Educator badge and guide for MENTOR role, along with all navigation and user avatar button', () => {
            const testStore = createTestStore({
                _id: '1',
                email: 'mentor@test.com',
                firstName: 'Jan',
                role: UserRoleEnum.MENTOR,
            } as any);

            const dispatchSpy = vi.spyOn(testStore, 'dispatch');

            render(
                <Provider store={testStore}>
                    <BrowserRouter>
                        <Header />
                    </BrowserRouter>
                </Provider>
            );

            // Educator badge
            expect(screen.getByText('Educator')).toBeInTheDocument();

            // Navigation items
            expect(screen.getByText('Materials')).toBeInTheDocument();
            expect(screen.getByText('Educators guide')).toBeInTheDocument();
            expect(screen.getByText('Self assessment')).toBeInTheDocument();
            expect(screen.getByText('Assessment results')).toBeInTheDocument();
            expect(screen.getByAltText('Language')).toBeInTheDocument();

            // User button with user's firstName
            const userBtn = screen.getByRole('button', { name: /jan/i });
            expect(userBtn).toBeInTheDocument();

            // Click user button to open DropdownMenu
            fireEvent.click(userBtn);

            expect(screen.getByText('User profile')).toBeInTheDocument();
            expect(screen.getByText('Log out')).toBeInTheDocument();

            // Click profile
            fireEvent.click(screen.getByText('User profile'));
            expect(mockedNavigate).toHaveBeenCalledWith('/my-profile');

            // Open again and click logout
            fireEvent.click(userBtn);
            fireEvent.click(screen.getByText('Log out'));
            expect(dispatchSpy).toHaveBeenCalledWith({ type: UserActionTypes.SIGN_OUT });
            expect(mockedNavigate).toHaveBeenCalledWith('/');
        });

        it('does NOT render Educator badge or Educators guide for SENIOR role', () => {
            const testStore = createTestStore({
                _id: '2',
                email: 'senior@test.com',
                firstName: 'Anna',
                role: UserRoleEnum.SENIOR,
            } as any);

            render(
                <Provider store={testStore}>
                    <BrowserRouter>
                        <Header />
                    </BrowserRouter>
                </Provider>
            );

            expect(screen.queryByText('Educator')).not.toBeInTheDocument();
            expect(screen.queryByText('Educators guide')).not.toBeInTheDocument();

            expect(screen.getByText('Materials')).toBeInTheDocument();
            expect(screen.getByText('Self assessment')).toBeInTheDocument();
            expect(screen.getByText('Assessment results')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /anna/i })).toBeInTheDocument();
        });
    });

    describe('Mobile Header', () => {
        beforeEach(() => {
            mockIsMobile = true;
        });

        it('renders Language button and hamburger menu containing Materials and Log In when unauthenticated', () => {
            const testStore = createTestStore(null);
            render(
                <Provider store={testStore}>
                    <BrowserRouter>
                        <Header />
                    </BrowserRouter>
                </Provider>
            );

            // Language button present on mobile
            expect(screen.getByAltText('Language')).toBeInTheDocument();

            // Hamburger menu button present
            const hamburgerBtn = screen.getByAltText('Menu');
            expect(hamburgerBtn).toBeInTheDocument();

            // Open hamburger
            fireEvent.click(hamburgerBtn);

            // Menu contains only Materials and Log In
            expect(screen.getByText('Materials')).toBeInTheDocument();
            expect(screen.getByText('Log In')).toBeInTheDocument();
            expect(screen.queryByText('Assessment results')).not.toBeInTheDocument();
            expect(screen.queryByText('User profile')).not.toBeInTheDocument();
        });

        it('renders Language button and hamburger menu with all items for authenticated MENTOR', () => {
            const testStore = createTestStore({
                _id: '1',
                email: 'mentor@test.com',
                firstName: 'Jan',
                role: UserRoleEnum.MENTOR,
            } as any);

            render(
                <Provider store={testStore}>
                    <BrowserRouter>
                        <Header />
                    </BrowserRouter>
                </Provider>
            );

            expect(screen.getByAltText('Language')).toBeInTheDocument();

            const hamburgerBtn = screen.getByAltText('Menu');
            fireEvent.click(hamburgerBtn);

            expect(screen.getByText('Materials')).toBeInTheDocument();
            expect(screen.getByText('Educators guide')).toBeInTheDocument();
            expect(screen.getByText('Self assessment')).toBeInTheDocument();
            expect(screen.getByText('Assessment results')).toBeInTheDocument();
            expect(screen.getByText('User profile')).toBeInTheDocument();
            expect(screen.getByText('Log out')).toBeInTheDocument();
        });

        it('renders Language button and hamburger menu without Educators guide for authenticated SENIOR', () => {
            const testStore = createTestStore({
                _id: '2',
                email: 'senior@test.com',
                firstName: 'Anna',
                role: UserRoleEnum.SENIOR,
            } as any);

            render(
                <Provider store={testStore}>
                    <BrowserRouter>
                        <Header />
                    </BrowserRouter>
                </Provider>
            );

            const hamburgerBtn = screen.getByAltText('Menu');
            fireEvent.click(hamburgerBtn);

            expect(screen.getByText('Materials')).toBeInTheDocument();
            expect(screen.queryByText('Educators guide')).not.toBeInTheDocument();
            expect(screen.getByText('Self assessment')).toBeInTheDocument();
            expect(screen.getByText('Assessment results')).toBeInTheDocument();
            expect(screen.getByText('User profile')).toBeInTheDocument();
            expect(screen.getByText('Log out')).toBeInTheDocument();
        });
    });
});
