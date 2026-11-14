import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { Flipbook } from '../src/components/flipbook/flipbook';
import {
    ZOOM_MIN,
    ZOOM_MAX,
    ZOOM_STEP,
    isSpreadViewport,
    normalizePageForMode,
    getLastPage,
    getSpreadState,
    formatPageIndicator,
    getNextPage,
    getPrevPage,
    isNextDisabled,
    isPrevDisabled,
    clampZoom,
    stepZoom,
    calculateZoomScrollAnchor,
    clampScrollPosition,
} from '../src/components/flipbook/flipbook.helpers';
import type { IMaterial } from '../src/types/material';
import * as materialsFunctions from '../src/helpers/materials.functions';

vi.mock('@tolgee/react', () => ({
    useTranslate: () => ({
        t: (_key: string, defaultValue?: string) => defaultValue ?? _key,
    }),
}));

vi.mock('react-pdf', () => ({
    Document: ({ file, children }: { file?: string; children?: React.ReactNode }) => (
        <div data-testid="mock-document" data-file={file}>
            {children}
        </div>
    ),
    Page: ({
        pageNumber,
        scale,
        renderTextLayer,
    }: {
        pageNumber?: number;
        scale?: number;
        renderTextLayer?: boolean;
    }) => (
        <div
            data-testid="mock-page"
            data-page={pageNumber}
            data-scale={scale}
            data-text-layer={String(renderTextLayer ?? true)}
        >
            Page {pageNumber}
        </div>
    ),
    pdfjs: {
        GlobalWorkerOptions: {
            workerSrc: '',
        },
    },
}));

vi.mock('../src/translations/utils', () => ({
    getCurrentLocale: () => 'en',
}));

const createMockMaterial = (pages: number): IMaterial => ({
    name: 'Handbook_PDF',
    category: 'MENTAL_HEALTH',
    translation: 'materials.handbook.mentalHealth',
    type: 'HANDBOOK',
    languages: {
        en: {
            name: 'Handbook_PDF',
            fileExtension: 'pdf',
            pages,
        },
        pl: {
            name: 'Handbook_PDF',
            fileExtension: 'pdf',
            pages,
        },
    },
});

const setViewportWidth = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
    });
};

const mockMatchMedia = (reducedMotion: boolean) => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
};

describe('Flipbook Component', () => {
    const mockMaterial = createMockMaterial(69);
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        vi.restoreAllMocks();
        setViewportWidth(1440);
        mockMatchMedia(false);

        originalFetch = global.fetch;
        global.fetch = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
            const headers = init?.headers as Record<string, string> | undefined;
            const pageHeader = headers?.['X-Page'] ?? '1';
            return {
                ok: true,
                statusText: 'OK',
                blob: async () =>
                    new Blob([`dummy pdf content page ${pageHeader}`], {
                        type: 'application/pdf',
                    }),
            } as unknown as Response;
        });

        window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob-url');
        window.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        vi.useRealTimers();
    });

    it('renders modal with dialog accessibility attributes, compact toolbar buttons, and centered closed-front cover in spread mode', async () => {
        const { container } = render(<Flipbook material={mockMaterial} />);

        const modal = screen.getByTestId('flipbook-modal');
        expect(modal).toHaveAttribute('role', 'dialog');
        expect(modal).toHaveAttribute('aria-modal', 'true');

        expect(screen.getByTestId('flipbook-zoom-out')).toBeDisabled();
        expect(screen.getByTestId('flipbook-zoom-reset')).toHaveTextContent('100%');
        expect(screen.getByTestId('flipbook-zoom-in')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-prev-page')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-next-page')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-download')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-close')).toBeInTheDocument();

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        const book = screen.getByTestId('flipbook-book');
        expect(book).toHaveAttribute('data-mode', 'spread');
        expect(book).toHaveAttribute('data-presentation', 'closed-front');
        expect(book).toHaveAttribute('data-zoom', '1');
        expect(book).toHaveAttribute('data-panning', 'false');

        await waitFor(() => {
            expect(screen.getByTestId('flipbook-cover-sheet')).toHaveAttribute(
                'data-page-number',
                '1',
            );
        });
        expect(container.querySelector('[class*="emptyHalf"]')).toBeNull();
    });

    it('activates two-page spread mode on desktop/wide tablet viewports (1920, 1440, 1366, 1024 px) and single-page mode on narrow viewports (768, 390 px)', async () => {
        for (const width of [1920, 1440, 1366, 1024]) {
            setViewportWidth(width);
            const { unmount } = render(<Flipbook material={mockMaterial} />);
            expect(screen.getByTestId('flipbook-book')).toHaveAttribute('data-mode', 'spread');
            unmount();
        }

        for (const width of [768, 390]) {
            setViewportWidth(width);
            const { unmount } = render(<Flipbook material={mockMaterial} />);
            expect(screen.getByTestId('flipbook-book')).toHaveAttribute('data-mode', 'single');
            unmount();
        }
    });

    it('transitions smoothly from closed-front cover (page 1) to open-spread (2–3, 4–5) with spine and back again', async () => {
        render(<Flipbook material={mockMaterial} />);

        const book = screen.getByTestId('flipbook-book');
        const prevBtn = screen.getByTestId('flipbook-prev-page');
        const nextBtn = screen.getByTestId('flipbook-next-page');

        await waitFor(() => {
            expect(screen.getByTestId('flipbook-cover-sheet')).toHaveAttribute(
                'data-page-number',
                '1',
            );
        });
        expect(prevBtn).toBeDisabled();
        expect(screen.queryByTestId('flipbook-left-page')).not.toBeInTheDocument();
        expect(screen.queryByTestId('flipbook-right-page')).not.toBeInTheDocument();

        // Click next -> open-spread 2–3/69
        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');
        expect(book).toHaveAttribute('data-presentation', 'open-spread');
        expect(prevBtn).not.toBeDisabled();

        await waitFor(() => {
            expect(screen.getByTestId('flipbook-left-page')).toHaveAttribute(
                'data-page-number',
                '2',
            );
            expect(screen.getByTestId('flipbook-right-page')).toHaveAttribute(
                'data-page-number',
                '3',
            );
            expect(screen.getByTestId('flipbook-spine')).toBeInTheDocument();
        });

        // Click next -> spread 4–5/69
        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('4–5/69');

        await waitFor(() => {
            expect(screen.getByTestId('flipbook-left-page')).toHaveAttribute(
                'data-page-number',
                '4',
            );
            expect(screen.getByTestId('flipbook-right-page')).toHaveAttribute(
                'data-page-number',
                '5',
            );
        });

        // Click prev -> back to 2–3/69
        fireEvent.click(prevBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');

        // Click prev -> back to closed-front cover 1/69
        fireEvent.click(prevBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');
        expect(book).toHaveAttribute('data-presentation', 'closed-front');
        expect(prevBtn).toBeDisabled();
    });

    it('handles even-page documents (8 pages) by displaying centered closed-back last page (8/8) with no blank half, and reopens spread on prev', async () => {
        vi.useFakeTimers();
        const evenMaterial = createMockMaterial(8);
        render(<Flipbook material={evenMaterial} />);

        const book = screen.getByTestId('flipbook-book');
        const nextBtn = screen.getByTestId('flipbook-next-page');
        const prevBtn = screen.getByTestId('flipbook-prev-page');

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/8');

        fireEvent.click(nextBtn); // 2–3/8
        fireEvent.click(nextBtn); // 4–5/8
        fireEvent.click(nextBtn); // 6–7/8
        fireEvent.click(nextBtn); // 8/8

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('8/8');
        expect(book).toHaveAttribute('data-presentation', 'closed-back');
        expect(nextBtn).toBeDisabled();

        act(() => {
            vi.advanceTimersByTime(650);
        });

        expect(screen.getByTestId('flipbook-back-sheet')).toHaveAttribute('data-page-number', '8');
        expect(screen.queryByTestId('flipbook-blank-page')).not.toBeInTheDocument();
        expect(screen.queryByTestId('flipbook-left-page')).not.toBeInTheDocument();
        expect(screen.queryByTestId('flipbook-right-page')).not.toBeInTheDocument();

        // Prev reopens 6–7/8
        fireEvent.click(prevBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('6–7/8');
        expect(book).toHaveAttribute('data-presentation', 'open-spread');
    });

    it('handles odd-page documents (5 pages) as final open-spread (4–5/5) and 1-page documents as centered closed-front with disabled controls', async () => {
        const oddMaterial = createMockMaterial(5);
        const { unmount } = render(<Flipbook material={oddMaterial} />);

        const nextBtn = screen.getByTestId('flipbook-next-page');
        fireEvent.click(nextBtn); // 2–3/5
        fireEvent.click(nextBtn); // 4–5/5

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('4–5/5');
        expect(screen.getByTestId('flipbook-book')).toHaveAttribute(
            'data-presentation',
            'open-spread',
        );
        expect(nextBtn).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByTestId('flipbook-left-page')).toHaveAttribute(
                'data-page-number',
                '4',
            );
            expect(screen.getByTestId('flipbook-right-page')).toHaveAttribute(
                'data-page-number',
                '5',
            );
        });
        unmount();

        // Single-page document (1 page)
        const singlePageMaterial = createMockMaterial(1);
        const { container } = render(<Flipbook material={singlePageMaterial} />);

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/1');
        expect(screen.getByTestId('flipbook-book')).toHaveAttribute(
            'data-presentation',
            'closed-front',
        );
        expect(screen.getByTestId('flipbook-cover-sheet')).toHaveAttribute(
            'data-page-number',
            '1',
        );
        expect(container.querySelector('[class*="emptyHalf"]')).toBeNull();
        expect(screen.getByTestId('flipbook-prev-page')).toBeDisabled();
        expect(screen.getByTestId('flipbook-next-page')).toBeDisabled();
    });

    it('switches dynamically between single-page and spread modes on window resize and normalizes odd page numbers into spreads', async () => {
        setViewportWidth(768);
        render(<Flipbook material={mockMaterial} />);

        expect(screen.getByTestId('flipbook-book')).toHaveAttribute('data-mode', 'single');
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        const nextBtn = screen.getByTestId('flipbook-next-page');
        fireEvent.click(nextBtn); // 2/69
        fireEvent.click(nextBtn); // 3/69
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('3/69');

        // Resize to desktop (1440px) -> page 3 normalizes to spread 2–3/69
        act(() => {
            setViewportWidth(1440);
            window.dispatchEvent(new Event('resize'));
        });

        expect(screen.getByTestId('flipbook-book')).toHaveAttribute('data-mode', 'spread');
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');

        // Resize back to mobile (390px) -> single-page mode on page 2/69
        act(() => {
            setViewportWidth(390);
            window.dispatchEvent(new Event('resize'));
        });

        expect(screen.getByTestId('flipbook-book')).toHaveAttribute('data-mode', 'single');
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2/69');
    });

    it('renders 3D flipping leaf animation during page transitions and clears it after animation completes, while supporting rapid clicks', async () => {
        vi.useFakeTimers();
        render(<Flipbook material={mockMaterial} />);

        const nextBtn = screen.getByTestId('flipbook-next-page');
        const prevBtn = screen.getByTestId('flipbook-prev-page');

        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-flipping-leaf')).toHaveAttribute(
            'data-direction',
            'next',
        );
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');

        act(() => {
            vi.advanceTimersByTime(650);
        });
        expect(screen.queryByTestId('flipbook-flipping-leaf')).not.toBeInTheDocument();

        // Rapid consecutive clicks: 2–3 -> 4–5 -> 6–7 -> 8–9
        fireEvent.click(nextBtn);
        fireEvent.click(nextBtn);
        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('8–9/69');

        fireEvent.click(prevBtn);
        expect(screen.getByTestId('flipbook-flipping-leaf')).toHaveAttribute(
            'data-direction',
            'prev',
        );
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('6–7/69');
    });

    it('enables PDF text layer on resting pages and disables it on animated flipping leaf faces', async () => {
        render(<Flipbook material={mockMaterial} />);

        await waitFor(() => {
            expect(
                (window.URL.createObjectURL as unknown as { mock: { calls: unknown[] } }).mock
                    .calls.length,
            ).toBeGreaterThanOrEqual(5);
        });

        // Resting page has text layer enabled
        expect(screen.getByTestId('mock-page')).toHaveAttribute('data-text-layer', 'true');

        fireEvent.click(screen.getByTestId('flipbook-next-page'));

        const leaf = screen.getByTestId('flipbook-flipping-leaf');
        await waitFor(() => {
            const leafPages = within(leaf).getAllByTestId('mock-page');
            expect(leafPages).toHaveLength(2);
            leafPages.forEach((p) => {
                expect(p).toHaveAttribute('data-text-layer', 'false');
            });
        });

        const baseRight = screen.getByTestId('flipbook-right-page');
        expect(within(baseRight).getByTestId('mock-page')).toHaveAttribute(
            'data-text-layer',
            'true',
        );
    });

    it('prefetches and displays preview images for upcoming pages during page flip animation', async () => {
        const { pdfjs } = await import('react-pdf');
        const mockGetDocument = vi.fn().mockImplementation(() => ({
            promise: Promise.resolve({
                getPage: vi.fn().mockResolvedValue({
                    getViewport: vi.fn().mockReturnValue({ width: 600, height: 800 }),
                    render: vi.fn().mockReturnValue({ promise: Promise.resolve() }),
                }),
                destroy: vi.fn().mockResolvedValue(undefined),
            }),
        }));
        (pdfjs as unknown as { getDocument?: unknown }).getDocument = mockGetDocument;

        const originalToDataUrl = HTMLCanvasElement.prototype.toDataURL;
        const originalGetContext = HTMLCanvasElement.prototype.getContext;

        HTMLCanvasElement.prototype.toDataURL = vi
            .fn()
            .mockReturnValue('data:image/jpeg;base64,mockpreviewdata');
        HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
            fillRect: vi.fn(),
            clearRect: vi.fn(),
            drawImage: vi.fn(),
            getImageData: vi.fn(),
            putImageData: vi.fn(),
            createImageData: vi.fn(),
            setTransform: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
        } as unknown as CanvasRenderingContext2D);

        try {
            render(<Flipbook material={mockMaterial} />);

            await waitFor(() => {
                expect(mockGetDocument).toHaveBeenCalled();
            });

            fireEvent.click(screen.getByTestId('flipbook-next-page'));

            await waitFor(() => {
                const previewImages = document.querySelectorAll(
                    'img[src="data:image/jpeg;base64,mockpreviewdata"]',
                );
                expect(previewImages.length).toBeGreaterThan(0);
            });
        } finally {
            delete (pdfjs as unknown as { getDocument?: unknown }).getDocument;
            HTMLCanvasElement.prototype.toDataURL = originalToDataUrl;
            HTMLCanvasElement.prototype.getContext = originalGetContext;
        }
    });

    it('disables 3D flip animation when prefers-reduced-motion: reduce is active', async () => {
        mockMatchMedia(true);
        render(<Flipbook material={mockMaterial} />);

        const book = screen.getByTestId('flipbook-book');
        expect(book).toHaveAttribute('data-reduced-motion', 'true');

        fireEvent.click(screen.getByTestId('flipbook-next-page'));
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');
        expect(screen.queryByTestId('flipbook-flipping-leaf')).not.toBeInTheDocument();
    });

    it('adjusts zoom from 100% up to 300% without remounting the Document, resets on zoom-reset button, and resets on page turn', async () => {
        render(<Flipbook material={mockMaterial} />);

        const zoomOutBtn = screen.getByTestId('flipbook-zoom-out');
        const zoomInBtn = screen.getByTestId('flipbook-zoom-in');
        const zoomResetBtn = screen.getByTestId('flipbook-zoom-reset');
        const book = screen.getByTestId('flipbook-book');

        await waitFor(() => {
            expect(screen.getByTestId('mock-page')).toHaveAttribute('data-scale', '1');
        });
        const initialDocNode = screen.getByTestId('mock-document');
        expect(zoomOutBtn).toBeDisabled();
        expect(zoomResetBtn).toHaveTextContent('100%');

        // Zoom in -> 125% (1.25), Document element is preserved (no remount/flicker)
        fireEvent.click(zoomInBtn);
        expect(book).toHaveAttribute('data-zoom', '1.25');
        expect(book).toHaveAttribute('data-zoomed', 'true');
        expect(zoomResetBtn).toHaveTextContent('125%');
        expect(screen.getByTestId('mock-page')).toHaveAttribute('data-scale', '1.25');
        expect(screen.getByTestId('mock-document')).toBe(initialDocNode);
        expect(zoomOutBtn).not.toBeDisabled();

        // Reset via zoom-reset button -> back to 100%
        fireEvent.click(zoomResetBtn);
        expect(book).toHaveAttribute('data-zoom', '1');
        expect(book).toHaveAttribute('data-zoomed', 'false');
        expect(zoomResetBtn).toHaveTextContent('100%');
        expect(zoomOutBtn).toBeDisabled();

        // Zoom all the way up to 300% (8 clicks of +0.25) -> disables zoomInBtn
        for (let i = 0; i < 8; i++) {
            fireEvent.click(zoomInBtn);
        }
        expect(book).toHaveAttribute('data-zoom', '3');
        expect(zoomResetBtn).toHaveTextContent('300%');
        expect(zoomInBtn).toBeDisabled();

        // Navigating to next page while zoomed resets zoom back to 100%
        fireEvent.click(screen.getByTestId('flipbook-next-page'));
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');
        expect(book).toHaveAttribute('data-zoom', '1');
        expect(book).toHaveAttribute('data-zoomed', 'false');
        expect(zoomResetBtn).toHaveTextContent('100%');
    });

    it('supports edge clicks and swipe/mouse page-turns at zoom 1, and switches to drag-to-pan (grab/grabbing) without flipping pages when zoomed in', async () => {
        render(<Flipbook material={mockMaterial} />);

        const edgeNext = screen.getByTestId('flipbook-edge-next');
        const edgePrev = screen.getByTestId('flipbook-edge-prev');
        const book = screen.getByTestId('flipbook-book');
        const viewer = screen.getByTestId('flipbook-viewer');

        expect(book).toHaveAttribute('data-zoomed', 'false');

        // Edge click next/prev at zoom 1
        fireEvent.click(edgeNext);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');
        fireEvent.click(edgePrev);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        // Touch swipe next/prev at zoom 1
        fireEvent.touchStart(book, { changedTouches: [{ clientX: 280, clientY: 200 }] });
        fireEvent.touchEnd(book, { changedTouches: [{ clientX: 90, clientY: 205 }] });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');
        fireEvent.touchStart(book, { changedTouches: [{ clientX: 90, clientY: 200 }] });
        fireEvent.touchEnd(book, { changedTouches: [{ clientX: 280, clientY: 205 }] });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        // Zoom in -> edge/swipe page flips disabled, drag-to-pan enabled
        fireEvent.click(screen.getByTestId('flipbook-zoom-in'));
        expect(book).toHaveAttribute('data-zoomed', 'true');

        fireEvent.click(edgeNext);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        fireEvent.touchStart(book, { changedTouches: [{ clientX: 280, clientY: 200 }] });
        fireEvent.touchEnd(book, { changedTouches: [{ clientX: 90, clientY: 205 }] });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        // Mock viewer scrollable dimensions for drag-to-pan test
        Object.defineProperty(viewer, 'scrollWidth', { configurable: true, value: 1600 });
        Object.defineProperty(viewer, 'scrollHeight', { configurable: true, value: 1400 });
        Object.defineProperty(viewer, 'clientWidth', { configurable: true, value: 800 });
        Object.defineProperty(viewer, 'clientHeight', { configurable: true, value: 700 });
        viewer.scrollLeft = 100;
        viewer.scrollTop = 100;

        fireEvent.mouseDown(book, { button: 0, clientX: 300, clientY: 300 });
        expect(book).toHaveAttribute('data-panning', 'true');

        fireEvent.mouseMove(window, { clientX: 220, clientY: 250 });
        expect(viewer.scrollLeft).toBe(180);
        expect(viewer.scrollTop).toBe(150);

        fireEvent.mouseUp(window, { clientX: 220, clientY: 250 });
        expect(book).toHaveAttribute('data-panning', 'false');
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');
    });

    it('supports keyboard shortcuts (ArrowLeft, ArrowRight, Home, End, +, -, 0, Escape)', async () => {
        const handleClose = vi.fn();
        render(<Flipbook material={mockMaterial} onClose={handleClose} />);

        await waitFor(() => {
            expect(screen.getByTestId('mock-document')).toBeInTheDocument();
        });

        const book = screen.getByTestId('flipbook-book');

        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');

        fireEvent.keyDown(window, { key: 'ArrowLeft' });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        fireEvent.keyDown(window, { key: 'End' });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('68–69/69');

        fireEvent.keyDown(window, { key: 'Home' });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        fireEvent.keyDown(window, { key: '+' });
        expect(book).toHaveAttribute('data-zoom', '1.25');

        fireEvent.keyDown(window, { key: '=' });
        expect(book).toHaveAttribute('data-zoom', '1.5');

        fireEvent.keyDown(window, { key: '-' });
        expect(book).toHaveAttribute('data-zoom', '1.25');

        fireEvent.keyDown(window, { key: '0' });
        expect(book).toHaveAttribute('data-zoom', '1');

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('traps Tab and Shift+Tab keyboard focus inside the flipbook modal', async () => {
        const externalBtn = document.createElement('button');
        externalBtn.textContent = 'Outside trigger';
        document.body.appendChild(externalBtn);
        externalBtn.focus();

        try {
            const { unmount } = render(<Flipbook material={mockMaterial} />);

            await waitFor(() => {
                expect(screen.getByTestId('mock-document')).toBeInTheDocument();
            });

            const modal = screen.getByTestId('flipbook-modal');
            const firstEnabled = screen.getByTestId('flipbook-zoom-in');
            const nextBtn = screen.getByTestId('flipbook-next-page');
            const closeBtn = screen.getByTestId('flipbook-close');

            expect(modal).toHaveFocus();

            // Shift+Tab from dialog root wraps to last enabled focusable control
            fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
            expect(closeBtn).toHaveFocus();

            // Tab from last enabled focusable wraps back to first enabled control
            fireEvent.keyDown(window, { key: 'Tab' });
            expect(firstEnabled).toHaveFocus();

            // Shift+Tab from first enabled focusable wraps back to last enabled control
            fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
            expect(closeBtn).toHaveFocus();

            // Interior enabled control does not wrap prematurely
            nextBtn.focus();
            fireEvent.keyDown(window, { key: 'Tab' });
            expect(nextBtn).toHaveFocus();

            unmount();
            expect(externalBtn).toHaveFocus();
        } finally {
            externalBtn.remove();
        }
    });

    it('calls onClose when clicking close button or overlay backdrop', async () => {
        const handleClose = vi.fn();
        render(<Flipbook material={mockMaterial} onClose={handleClose} />);

        await waitFor(() => {
            expect(screen.getByTestId('mock-document')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('flipbook-close'));
        expect(handleClose).toHaveBeenCalledTimes(1);

        const overlay = screen.getByTestId('flipbook-overlay');
        fireEvent.click(overlay);
        expect(handleClose).toHaveBeenCalledTimes(2);
    });

    it('triggers file download on download button click', async () => {
        const downloadSpy = vi
            .spyOn(materialsFunctions, 'downloadFile')
            .mockImplementation(() => {});
        render(<Flipbook material={mockMaterial} />);

        await waitFor(() => {
            expect(screen.getByTestId('mock-document')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('flipbook-download'));
        expect(downloadSpy).toHaveBeenCalledWith(
            '/cdn/materials/Handbook_PDF/en/Handbook_PDF.pdf',
        );
    });

    it('displays error message when page fetching fails', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            statusText: 'Not Found',
        } as unknown as Response);

        render(<Flipbook material={mockMaterial} />);

        await waitFor(() => {
            expect(screen.getByTestId('flipbook-error')).toHaveTextContent(
                'Cannot fetch pdf document.',
            );
        });
    });

    it('revokes cached blob URLs on unmount', async () => {
        const { unmount } = render(<Flipbook material={mockMaterial} />);

        await waitFor(() => {
            expect(window.URL.createObjectURL).toHaveBeenCalled();
        });

        unmount();
        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(
            'blob:http://localhost/mock-blob-url',
        );
    });
});

describe('flipbook.helpers', () => {
    it('determines spread viewport based on SPREAD_BREAKPOINT (1024px)', () => {
        expect(isSpreadViewport(1024)).toBe(true);
        expect(isSpreadViewport(1023)).toBe(false);
    });

    it('normalizes page number and calculates last page according to layout mode and total page bounds', () => {
        expect(normalizePageForMode(3, 69, true)).toBe(2);
        expect(normalizePageForMode(3, 69, false)).toBe(3);
        expect(normalizePageForMode(1, 69, true)).toBe(1);
        expect(normalizePageForMode(100, 69, false)).toBe(69);

        expect(getLastPage(69, true)).toBe(68);
        expect(getLastPage(8, true)).toBe(8);
        expect(getLastPage(8, false)).toBe(8);
        expect(getLastPage(1, true)).toBe(1);
    });

    it('calculates three book presentation states (closed-front, open-spread, closed-back) across spread and single modes', () => {
        // closed-front cover
        expect(getSpreadState(1, 69, true)).toEqual({
            presentation: 'closed-front',
            isCover: true,
            isBackCover: false,
            leftPage: null,
            rightPage: 1,
            isSingleSheetVisible: true,
        });

        // 1-page PDF
        expect(getSpreadState(1, 1, true)).toEqual({
            presentation: 'closed-front',
            isCover: true,
            isBackCover: true,
            leftPage: null,
            rightPage: 1,
            isSingleSheetVisible: true,
        });

        // middle open-spread
        expect(getSpreadState(2, 69, true)).toEqual({
            presentation: 'open-spread',
            isCover: false,
            isBackCover: false,
            leftPage: 2,
            rightPage: 3,
            isSingleSheetVisible: false,
        });

        // odd last spread (68-69/69 stays open-spread)
        expect(getSpreadState(68, 69, true)).toEqual({
            presentation: 'open-spread',
            isCover: false,
            isBackCover: false,
            leftPage: 68,
            rightPage: 69,
            isSingleSheetVisible: false,
        });

        // even last page (8/8 becomes closed-back single centered sheet)
        expect(getSpreadState(8, 8, true)).toEqual({
            presentation: 'closed-back',
            isCover: false,
            isBackCover: true,
            leftPage: 8,
            rightPage: null,
            isSingleSheetVisible: true,
        });

        // single mode (5/69)
        expect(getSpreadState(5, 69, false)).toEqual({
            presentation: 'open-spread',
            isCover: false,
            isBackCover: false,
            leftPage: null,
            rightPage: 5,
            isSingleSheetVisible: true,
        });
    });

    it('formats page indicator string across various spreads, single mode, and empty document', () => {
        expect(formatPageIndicator(1, 69, true)).toBe('1/69');
        expect(formatPageIndicator(2, 69, true)).toBe('2\u20133/69');
        expect(formatPageIndicator(68, 69, true)).toBe('68\u201369/69');
        expect(formatPageIndicator(8, 8, true)).toBe('8/8');
        expect(formatPageIndicator(3, 69, false)).toBe('3/69');
        expect(formatPageIndicator(1, 0, true)).toBe('1/—');
    });

    it('navigates next and prev pages correctly in spread and single modes', () => {
        expect(getNextPage(1, 69, true)).toBe(2);
        expect(getNextPage(2, 69, true)).toBe(4);
        expect(getNextPage(68, 69, true)).toBe(68);
        expect(getPrevPage(2, true)).toBe(1);
        expect(getPrevPage(4, true)).toBe(2);
        expect(getPrevPage(8, true)).toBe(6);

        expect(getNextPage(3, 69, false)).toBe(4);
        expect(getPrevPage(3, false)).toBe(2);
    });

    it('evaluates disabled state for next and previous navigation controls', () => {
        expect(isNextDisabled(1, 1, true)).toBe(true);
        expect(isNextDisabled(68, 69, true)).toBe(true);
        expect(isNextDisabled(8, 8, true)).toBe(true);
        expect(isNextDisabled(6, 8, true)).toBe(false);
        expect(isNextDisabled(69, 69, false)).toBe(true);

        expect(isPrevDisabled(1)).toBe(true);
        expect(isPrevDisabled(2)).toBe(false);
    });

    it('clamps, steps zoom levels cleanly and computes scroll anchor & clamping coordinates', () => {
        expect(ZOOM_MIN).toBe(1);
        expect(ZOOM_MAX).toBe(3);
        expect(ZOOM_STEP).toBe(0.25);

        expect(clampZoom(0.4)).toBe(1);
        expect(clampZoom(4.5)).toBe(3);
        expect(stepZoom(1, 1)).toBe(1.25);
        expect(stepZoom(1, -1)).toBe(1);
        expect(stepZoom(3, 1)).toBe(3);

        // Zooming 2x centered in an 800x600 viewport over 800x600 -> 1600x1200 content
        expect(
            calculateZoomScrollAnchor({
                currentScrollLeft: 0,
                currentScrollTop: 0,
                prevContentWidth: 800,
                prevContentHeight: 600,
                nextContentWidth: 1600,
                nextContentHeight: 1200,
                anchorX: 400,
                anchorY: 300,
                viewportWidth: 800,
                viewportHeight: 600,
            }),
        ).toEqual({
            nextScrollLeft: 400,
            nextScrollTop: 300,
        });

        expect(clampScrollPosition(-50, 9999, 1200, 1000, 800, 600)).toEqual({
            scrollLeft: 0,
            scrollTop: 400,
        });
    });
});
