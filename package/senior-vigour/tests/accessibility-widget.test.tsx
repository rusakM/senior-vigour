import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../src/redux/root-reducer';
import { AccessibilityProvider } from '../src/context/accessibility-context';
import AccessibilityWidget, {
    AccessibilityTrigger,
} from '../src/components/accessibility-widget/accessibility-widget';
import Header from '../src/components/header/header';
import QuestionnaireHeader from '../src/components/questionnaire-header/questionnaire-header';
import NotFound from '../src/pages/not-found/not-found';
import Flipbook from '../src/components/flipbook/flipbook';
import { A11Y_STORAGE_KEY } from '../src/types/accessibility';
import { MaterialTypeEnum, type IMaterial } from '../src/types/material';
import { UserRoleEnum } from '../src/types/user';

vi.mock('@tolgee/react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@tolgee/react')>();
    return {
        ...actual,
        useTranslate: () => ({
            t: (_key: string, defaultValue?: string) => defaultValue || _key,
        }),
    };
});

vi.mock('react-pdf', () => ({
    pdfjs: { GlobalWorkerOptions: { workerSrc: '' } },
    Document: ({
        children,
        onLoadSuccess,
    }: {
        children: React.ReactNode;
        onLoadSuccess?: (info: { numPages: number }) => void;
    }) => {
        if (onLoadSuccess) {
            setTimeout(() => onLoadSuccess({ numPages: 1 }), 0);
        }
        return <div data-testid="mock-document">{children}</div>;
    },
    Page: ({ pageNumber }: { pageNumber: number }) => (
        <div data-testid="mock-page" data-page={pageNumber} />
    ),
}));

const createStore = (withUser = false) =>
    configureStore({
        reducer: rootReducer,
        preloadedState: {
            user: {
                currentUser: withUser
                    ? {
                          _id: 'u-1',
                          email: 'senior@example.com',
                          firstName: 'Anna',
                          lastName: 'Nowak',
                          role: UserRoleEnum.PLAYER,
                      }
                    : null,
                isFetching: false,
                signInEmail: '',
                userError: '',
            },
        },
    });

const mockMaterial: IMaterial = {
    name: 'Handbook_PDF',
    category: 'MENTAL_HEALTH',
    type: MaterialTypeEnum.HANDBOOK,
    translation: 'Handbook',
    languages: {
        en: { name: 'Handbook_PDF', fileExtension: 'pdf', pages: 8 },
    },
};

const clearRootA11yAttrs = () => {
    const root = document.documentElement;
    root.style.removeProperty('--sv-font-scale');
    [
        'data-a11y-font',
        'data-a11y-contrast',
        'data-a11y-spacing',
        'data-a11y-targets',
        'data-a11y-links',
        'data-a11y-motion',
    ].forEach((attr) => root.removeAttribute(attr));
};

describe('AccessibilityWidget & AccessibilityProvider', () => {
    beforeEach(() => {
        window.localStorage.clear();
        clearRootA11yAttrs();
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(new Blob(['pdf'])),
        } as unknown as Response);
        window.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/pdf');
        window.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        window.localStorage.clear();
        clearRootA11yAttrs();
    });

    it('falls back gracefully when localStorage has malformed or invalid preference values', () => {
        window.localStorage.setItem(A11Y_STORAGE_KEY, '{not-valid-json');

        render(
            <AccessibilityProvider>
                <AccessibilityTrigger />
                <AccessibilityWidget />
            </AccessibilityProvider>,
        );

        expect(document.documentElement.style.getPropertyValue('--sv-font-scale')).toBe('1');
        expect(document.documentElement).not.toHaveAttribute('data-a11y-contrast');
        expect(document.documentElement).not.toHaveAttribute('data-a11y-font');

        fireEvent.click(screen.getByTestId('a11y-trigger'));
        expect(screen.getByTestId('a11y-font-scale-value')).toHaveTextContent('100%');
    });

    it('opens panel with semantic dialog attributes, traps focus, closes on Escape and restores focus to trigger', async () => {
        render(
            <AccessibilityProvider>
                <AccessibilityTrigger />
                <AccessibilityWidget />
            </AccessibilityProvider>,
        );

        const trigger = screen.getByTestId('a11y-trigger');
        expect(trigger.tagName).toBe('BUTTON');
        expect(trigger).toHaveAttribute('aria-expanded', 'false');
        expect(trigger).toHaveAttribute('aria-controls', 'sv-accessibility-panel');
        expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');

        fireEvent.click(trigger);

        const panel = screen.getByTestId('a11y-panel');
        expect(panel).toHaveAttribute('role', 'dialog');
        expect(panel).toHaveAttribute('id', 'sv-accessibility-panel');
        expect(trigger).toHaveAttribute('aria-expanded', 'true');

        await waitFor(() => {
            expect(panel.contains(document.activeElement)).toBe(true);
        });

        const closeBtn = screen.getByTestId('a11y-panel-close');
        const resetBtn = screen.getByTestId('a11y-reset-button');

        closeBtn.focus();
        fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
        expect(resetBtn).toHaveFocus();

        fireEvent.keyDown(window, { key: 'Tab' });
        expect(closeBtn).toHaveFocus();

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(screen.queryByTestId('a11y-panel')).not.toBeInTheDocument();
        expect(trigger).toHaveAttribute('aria-expanded', 'false');

        await waitFor(() => {
            expect(trigger).toHaveFocus();
        });
    });

    it('scales typography in steps from 100% to 200% via --sv-font-scale without network calls', () => {
        const fetchSpy = vi.spyOn(global, 'fetch');

        render(
            <AccessibilityProvider>
                <AccessibilityTrigger />
                <AccessibilityWidget />
            </AccessibilityProvider>,
        );

        fireEvent.click(screen.getByTestId('a11y-trigger'));

        const decBtn = screen.getByTestId('a11y-font-decrease');
        const incBtn = screen.getByTestId('a11y-font-increase');
        const valueEl = screen.getByTestId('a11y-font-scale-value');

        expect(valueEl).toHaveAttribute('aria-live', 'polite');
        expect(valueEl).toHaveTextContent('100%');
        expect(decBtn).toBeDisabled();
        expect(incBtn).not.toBeDisabled();

        fireEvent.click(incBtn);
        expect(valueEl).toHaveTextContent('125%');
        expect(document.documentElement.style.getPropertyValue('--sv-font-scale')).toBe('1.25');

        fireEvent.click(incBtn);
        fireEvent.click(incBtn);
        fireEvent.click(incBtn);
        expect(valueEl).toHaveTextContent('200%');
        expect(document.documentElement.style.getPropertyValue('--sv-font-scale')).toBe('2');
        expect(incBtn).toBeDisabled();

        fireEvent.click(decBtn);
        expect(valueEl).toHaveTextContent('175%');
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('toggles all 7 features (A-G), persists them in localStorage, and clears everything on reset', () => {
        render(
            <AccessibilityProvider>
                <AccessibilityTrigger />
                <AccessibilityWidget />
            </AccessibilityProvider>,
        );

        fireEvent.click(screen.getByTestId('a11y-trigger'));

        // A: scale 150%
        fireEvent.click(screen.getByTestId('a11y-font-increase'));
        fireEvent.click(screen.getByTestId('a11y-font-increase'));

        // B: font mode readable
        fireEvent.click(screen.getByTestId('a11y-font-readable'));
        expect(document.documentElement).toHaveAttribute('data-a11y-font', 'readable');

        // C: high contrast
        const contrastSwitch = screen.getByTestId('a11y-toggle-contrast');
        expect(contrastSwitch).toHaveAttribute('role', 'switch');
        expect(contrastSwitch).toHaveAttribute('aria-checked', 'false');
        fireEvent.click(contrastSwitch);
        expect(contrastSwitch).toHaveAttribute('aria-checked', 'true');
        expect(document.documentElement).toHaveAttribute('data-a11y-contrast', 'high');

        // D: wide spacing
        const spacingSwitch = screen.getByTestId('a11y-toggle-spacing');
        fireEvent.click(spacingSwitch);
        expect(spacingSwitch).toHaveAttribute('aria-checked', 'true');
        expect(document.documentElement).toHaveAttribute('data-a11y-spacing', 'wide');

        // E: large targets
        const targetsSwitch = screen.getByTestId('a11y-toggle-targets');
        fireEvent.click(targetsSwitch);
        expect(targetsSwitch).toHaveAttribute('aria-checked', 'true');
        expect(document.documentElement).toHaveAttribute('data-a11y-targets', 'large');

        // F: underline links
        const linksSwitch = screen.getByTestId('a11y-toggle-links');
        fireEvent.click(linksSwitch);
        expect(linksSwitch).toHaveAttribute('aria-checked', 'true');
        expect(document.documentElement).toHaveAttribute('data-a11y-links', 'underline');

        // G: reduced motion
        const motionSwitch = screen.getByTestId('a11y-toggle-motion');
        fireEvent.click(motionSwitch);
        expect(motionSwitch).toHaveAttribute('aria-checked', 'true');
        expect(document.documentElement).toHaveAttribute('data-a11y-motion', 'reduce');

        const rawSaved = window.localStorage.getItem(A11Y_STORAGE_KEY);
        expect(rawSaved).not.toBeNull();
        const saved = JSON.parse(rawSaved!);
        expect(saved).toEqual({
            fontScale: 1.5,
            fontMode: 'readable',
            highContrast: true,
            wideSpacing: true,
            largeTargets: true,
            underlineLinks: true,
            reducedMotion: true,
        });

        // Reset restores defaults and deletes localStorage key
        fireEvent.click(screen.getByTestId('a11y-reset-button'));
        expect(window.localStorage.getItem(A11Y_STORAGE_KEY)).toBeNull();
        expect(document.documentElement.style.getPropertyValue('--sv-font-scale')).toBe('1');
        expect(document.documentElement).not.toHaveAttribute('data-a11y-font');
        expect(document.documentElement).not.toHaveAttribute('data-a11y-contrast');
        expect(document.documentElement).not.toHaveAttribute('data-a11y-spacing');
        expect(document.documentElement).not.toHaveAttribute('data-a11y-targets');
        expect(document.documentElement).not.toHaveAttribute('data-a11y-links');
        expect(document.documentElement).not.toHaveAttribute('data-a11y-motion');
    });

    it('exposes accessibility trigger for anonymous and logged-in Header, QuestionnaireHeader, and NotFound sharing one global panel', () => {
        const store = createStore(false);
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <AccessibilityProvider>
                        <Header />
                        <QuestionnaireHeader title="Mental health" onQuit={vi.fn()} />
                        <NotFound />
                        <AccessibilityWidget />
                    </AccessibilityProvider>
                </MemoryRouter>
            </Provider>,
        );

        const triggers = screen.getAllByTestId('a11y-trigger');
        expect(triggers.length).toBe(3);

        // Opening via QuestionnaireHeader trigger opens exactly one dialog
        fireEvent.click(triggers[1]);
        expect(screen.getAllByTestId('a11y-panel')).toHaveLength(1);
    });

    it('synchronizes Reduced Motion mode from AccessibilityWidget directly with Flipbook navigation', async () => {
        render(
            <AccessibilityProvider>
                <Flipbook material={mockMaterial} onClose={vi.fn()} />
                <AccessibilityWidget />
            </AccessibilityProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('mock-document')).toBeInTheDocument();
        });

        const triggers = screen.getAllByTestId('a11y-trigger');
        fireEvent.click(triggers[0]);

        fireEvent.click(screen.getByTestId('a11y-toggle-motion'));
        fireEvent.keyDown(window, { key: 'Escape' });

        const book = screen.getByTestId('flipbook-book');
        expect(book).toHaveAttribute('data-reduced-motion', 'true');

        fireEvent.click(screen.getByTestId('flipbook-next-page'));
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/8');
        expect(screen.queryByTestId('flipbook-flipping-leaf')).not.toBeInTheDocument();
    });
});
