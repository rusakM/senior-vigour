import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import { store } from '../src/redux/store';
import LandingPage from '../src/pages/landing-page/landing-page';

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (key: string, defaultValue?: string) => defaultValue || key,
        }),
    };
});

describe('LandingPage Component', () => {
    it('renders Header, Hero, 6 Learning Areas, Flow Steps, Blog, Partners, and Footer', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <LandingPage />
                </BrowserRouter>
            </Provider>
        );

        // Hero
        expect(
            screen.getByText("Platform supporting seniors' mental well-being")
        ).toBeInTheDocument();

        // 6 Learning Areas
        expect(screen.getByText('Explore Learning Areas')).toBeInTheDocument();
        expect(screen.getByText('Mental health')).toBeInTheDocument();
        expect(screen.getByText('Physical health')).toBeInTheDocument();
        expect(screen.getByText('Nutrition')).toBeInTheDocument();
        expect(screen.getByText('Social interactions')).toBeInTheDocument();
        expect(screen.getByText('Ecology')).toBeInTheDocument();
        expect(screen.getByText('Digital technologies')).toBeInTheDocument();

        // Flow Steps
        expect(screen.getByText('How does it work?')).toBeInTheDocument();

        // Blog
        expect(
            screen.getByText('Check out our blog and learn more about our initiative!')
        ).toBeInTheDocument();

        // Partners
        expect(screen.getByText('Project Partners')).toBeInTheDocument();
        expect(screen.getByTitle('Project Net')).toBeInTheDocument();
        expect(screen.getByTitle('Novareckon')).toBeInTheDocument();
        expect(screen.getByTitle('Euro Lider')).toBeInTheDocument();
        expect(screen.getByTitle('Acufade')).toBeInTheDocument();
        expect(screen.getByTitle('InnovED')).toBeInTheDocument();
        expect(screen.getByTitle('Lovila')).toBeInTheDocument();

        // Background shapes
        expect(screen.getByTestId('background-shapes')).toBeInTheDocument();
    });

    it('hides hero section when currentUser is present', () => {
        const loggedInStore = configureStore({
            reducer: rootReducer,
            preloadedState: {
                user: {
                    currentUser: {
                        email: 'user@example.com',
                        role: 'STUDENT',
                    } as any,
                } as any,
            },
        });

        render(
            <Provider store={loggedInStore}>
                <BrowserRouter>
                    <LandingPage />
                </BrowserRouter>
            </Provider>
        );

        expect(
            screen.queryByText("Platform supporting seniors' mental well-being")
        ).not.toBeInTheDocument();
    });
});
