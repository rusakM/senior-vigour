import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import { store } from '../src/redux/store';
import App from '../src/App';

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTolgee: () => ({
            getLanguage: () => 'en',
        }),
        useTranslate: () => ({
            t: (key: string, defaultValue?: string) => defaultValue || key,
        }),
    };
});

describe('App Component', () => {
    it('renders LandingPage inside root route', () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByText("Platform supporting seniors' mental well-being")
        ).toBeInTheDocument();
    });

    it('renders SignIn page inside /signin route', () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/signin']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByRole('heading', { name: /sign in/i })
        ).toBeInTheDocument();
    });

    it('renders SignUp page inside /signup route', () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/signup']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByRole('heading', { name: /sign up/i })
        ).toBeInTheDocument();
    });

    it('renders Confirm page inside /confirm route when email is set', () => {
        const confirmStore = configureStore({
            reducer: rootReducer,
            preloadedState: {
                user: {
                    currentUser: null,
                    isFetching: false,
                    signInEmail: 'test@example.com',
                    userError: '',
                },
            },
        });

        render(
            <Provider store={confirmStore}>
                <MemoryRouter initialEntries={['/confirm']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByRole('heading', { name: /enter verification code/i })
        ).toBeInTheDocument();
    });

    it('redirects /confirm to landing page when email is not set', () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/confirm']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByText("Platform supporting seniors' mental well-being")
        ).toBeInTheDocument();
    });

    it('renders FillRegisterData page inside /signup-finish route', () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/signup-finish']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByRole('heading', { name: /tell us more about yourself!/i })
        ).toBeInTheDocument();
    });

    it('renders FillRegisterData page inside /more-info route', () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/more-info']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByRole('heading', { name: /tell us more about yourself!/i })
        ).toBeInTheDocument();
    });

    it('renders SelectRole page inside /select-role route', () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/select-role']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByText(/are you an educator\?/i)
        ).toBeInTheDocument();
    });

    it('renders SelectRole page inside /choose-role route', () => {
        render(
            <Provider store={store}>
                <MemoryRouter initialEntries={['/choose-role']}>
                    <App />
                </MemoryRouter>
            </Provider>
        );

        expect(
            screen.getByText(/are you an educator\?/i)
        ).toBeInTheDocument();
    });
});
