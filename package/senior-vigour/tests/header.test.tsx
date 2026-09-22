import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import Header from '../src/components/header/header';

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (key: string, defaultValue?: string) => defaultValue || key,
        }),
    };
});

describe('Header Component', () => {
    it('renders logo and navigation elements', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            </Provider>
        );

        const logo = screen.getByAltText('Senior Vigour Logo');
        expect(logo).toBeInTheDocument();
    });

    it('opens language dropdown when language button is clicked', () => {
        render(
            <Provider store={store}>
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

    it('renders desktop controls: Materials, Language button, and Log In', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <Header />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByText('Materials')).toBeInTheDocument();
        expect(screen.getByAltText('Language')).toBeInTheDocument();
        expect(screen.getByText('Log In')).toBeInTheDocument();
    });
});
