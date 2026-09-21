import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from '../src/redux/store';
import App from '../src/App';

// Mock Tolgee hook for testing
vi.mock('@tolgee/react', () => ({
    useTolgee: () => ({
        getLanguage: () => 'en',
    }),
}));

describe('App Component', () => {
    it('renders platform title inside main route', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        );

        expect(screen.getByText('Senior Vigour Platform')).toBeInTheDocument();
    });
});
