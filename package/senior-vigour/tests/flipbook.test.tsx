import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { Flipbook } from '../src/components/flipbook/flipbook';
import {
    isSpreadViewport,
    normalizePageForMode,
    getSpreadState,
    formatPageIndicator,
    getNextPage,
    getPrevPage,
    isNextDisabled,
    isPrevDisabled,
} from '../src/components/flipbook/flipbook.helpers';
import type { IMaterial } from '../src/types/material';
import * as materialsFunctions from '../src/helpers/materials.functions';

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

    it('renders modal with dialog accessibility attributes, toolbar buttons, and cover page in spread mode', async () => {
        render(<Flipbook material={mockMaterial} />);

        const modal = screen.getByTestId('flipbook-modal');
        expect(modal).toHaveAttribute('role', 'dialog');
        expect(modal).toHaveAttribute('aria-modal', 'true');

        expect(screen.getByTestId('flipbook-zoom-out')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-zoom-in')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-prev-page')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-next-page')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-download')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-close')).toBeInTheDocument();

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        await waitFor(() => {
            expect(screen.getByTestId('flipbook-book')).toHaveAttribute('data-mode', 'spread');
            expect(screen.getByTestId('flipbook-cover-sheet')).toHaveAttribute(
                'data-page-number',
                '1',
            );
        });
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

    it('displays cover (page 1) then two-page spreads (2–3, 4–5) with spine on desktop and navigates back cleanly', async () => {
        render(<Flipbook material={mockMaterial} />);

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

        // Click next -> spread 2–3/69
        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');
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

        // Click prev -> back to cover 1/69
        fireEvent.click(prevBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');
        expect(prevBtn).toBeDisabled();
    });

    it('handles even-page documents (8 pages) by showing page 8 on the left and a blank sheet on the right on the final spread', async () => {
        const evenMaterial = createMockMaterial(8);
        render(<Flipbook material={evenMaterial} />);

        const nextBtn = screen.getByTestId('flipbook-next-page');

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/8');

        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/8');

        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('4–5/8');

        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('6–7/8');

        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('8/8');
        expect(nextBtn).toBeDisabled();

        await waitFor(() => {
            expect(screen.getByTestId('flipbook-left-page')).toHaveAttribute(
                'data-page-number',
                '8',
            );
            expect(screen.getByTestId('flipbook-blank-page')).toBeInTheDocument();
            expect(screen.queryByTestId('flipbook-right-page')).not.toBeInTheDocument();
        });
    });

    it('handles odd-page documents on the final spread and single-page (1 page) documents with disabled next/prev controls', async () => {
        const oddMaterial = createMockMaterial(5);
        const { unmount } = render(<Flipbook material={oddMaterial} />);

        const nextBtn = screen.getByTestId('flipbook-next-page');
        fireEvent.click(nextBtn); // 2–3/5
        fireEvent.click(nextBtn); // 4–5/5

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('4–5/5');
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
        render(<Flipbook material={singlePageMaterial} />);

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/1');
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
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2/69');

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

    it('renders 3D flipping leaf animation during page transitions and clears it after animation completes, while supporting rapid clicks without losing pages', async () => {
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

    it('renders real page content on both faces of the flipping leaf and disables the PDF text layer', async () => {
        render(<Flipbook material={mockMaterial} />);

        // Wait until the cover and prefetched neighbouring pages are available
        await waitFor(() => {
            expect(
                (window.URL.createObjectURL as unknown as { mock: { calls: unknown[] } }).mock
                    .calls.length,
            ).toBeGreaterThanOrEqual(5);
        });

        fireEvent.click(screen.getByTestId('flipbook-next-page'));

        const leaf = screen.getByTestId('flipbook-flipping-leaf');
        await waitFor(() => {
            // front face = cover (page 1), back face = page 2 of the new spread
            expect(within(leaf).getAllByTestId('mock-page')).toHaveLength(2);
        });

        screen.getAllByTestId('mock-page').forEach((page) => {
            expect(page).toHaveAttribute('data-text-layer', 'false');
        });
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

    it('supports clicking book edges and touch swipe gestures at default zoom, and blocks edge/swipe page turns when zoomed in (zoom > 1)', async () => {
        render(<Flipbook material={mockMaterial} />);

        const edgeNext = screen.getByTestId('flipbook-edge-next');
        const edgePrev = screen.getByTestId('flipbook-edge-prev');
        const book = screen.getByTestId('flipbook-book');

        expect(book).toHaveAttribute('data-zoomed', 'false');

        // Edge click next: 1/69 -> 2–3/69
        fireEvent.click(edgeNext);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');

        // Edge click prev: 2–3/69 -> 1/69
        fireEvent.click(edgePrev);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        // Touch swipe left (next): 1/69 -> 2–3/69
        fireEvent.touchStart(book, { changedTouches: [{ clientX: 280, clientY: 200 }] });
        fireEvent.touchEnd(book, { changedTouches: [{ clientX: 90, clientY: 205 }] });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');

        // Touch swipe right (prev): 2–3/69 -> 1/69
        fireEvent.touchStart(book, { changedTouches: [{ clientX: 90, clientY: 200 }] });
        fireEvent.touchEnd(book, { changedTouches: [{ clientX: 280, clientY: 205 }] });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        // Mouse drag left (next): 1/69 -> 2–3/69
        fireEvent.mouseDown(book, { clientX: 280, clientY: 200 });
        fireEvent.mouseUp(book, { clientX: 90, clientY: 205 });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');

        // Mouse drag right (prev): 2–3/69 -> 1/69
        fireEvent.mouseDown(book, { clientX: 90, clientY: 200 });
        fireEvent.mouseUp(book, { clientX: 280, clientY: 205 });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        // Zoom in (zoom = 1.2) -> edge clicks, swipes, and mouse drags must not turn pages
        fireEvent.click(screen.getByTestId('flipbook-zoom-in'));
        expect(book).toHaveAttribute('data-zoomed', 'true');

        fireEvent.click(edgeNext);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        fireEvent.touchStart(book, { changedTouches: [{ clientX: 280, clientY: 200 }] });
        fireEvent.touchEnd(book, { changedTouches: [{ clientX: 90, clientY: 205 }] });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        fireEvent.mouseDown(book, { clientX: 280, clientY: 200 });
        fireEvent.mouseUp(book, { clientX: 90, clientY: 205 });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');
    });

    it('navigates using ArrowLeft and ArrowRight keyboard shortcuts', async () => {
        render(<Flipbook material={mockMaterial} />);

        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2–3/69');

        fireEvent.keyDown(window, { key: 'ArrowLeft' });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');
    });

    it('calls onClose when Escape key is pressed', async () => {
        const handleClose = vi.fn();
        render(<Flipbook material={mockMaterial} onClose={handleClose} />);

        await waitFor(() => {
            expect(screen.getByTestId('mock-document')).toBeInTheDocument();
        });

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalledTimes(1);
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

    it('adjusts zoom level when zoom buttons are clicked', async () => {
        render(<Flipbook material={mockMaterial} />);

        await waitFor(() => {
            expect(screen.getByTestId('mock-page')).toHaveAttribute('data-scale', '1');
        });

        fireEvent.click(screen.getByTestId('flipbook-zoom-in'));
        expect(screen.getByTestId('mock-page')).toHaveAttribute('data-scale', '1.2');

        fireEvent.click(screen.getByTestId('flipbook-zoom-out'));
        expect(screen.getByTestId('mock-page')).toHaveAttribute('data-scale', '1');
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

    it('normalizes page number according to layout mode and total page bounds', () => {
        expect(normalizePageForMode(3, 69, true)).toBe(2);
        expect(normalizePageForMode(3, 69, false)).toBe(3);
        expect(normalizePageForMode(1, 69, true)).toBe(1);
        expect(normalizePageForMode(100, 69, false)).toBe(69);
    });

    it('calculates spread state for cover, standard spreads, blank final pages, and single mode', () => {
        // okładka
        expect(getSpreadState(1, 69, true)).toEqual({
            isCover: true,
            leftPage: null,
            rightPage: 1,
            isRightBlank: false,
        });

        // rozkładówka
        expect(getSpreadState(2, 69, true)).toEqual({
            isCover: false,
            leftPage: 2,
            rightPage: 3,
            isRightBlank: false,
        });

        // parzysta liczba stron (ostatnia rozkładówka z pustą prawą stroną)
        expect(getSpreadState(8, 8, true)).toEqual({
            isCover: false,
            leftPage: 8,
            rightPage: null,
            isRightBlank: true,
        });

        // tryb single
        expect(getSpreadState(5, 69, false)).toEqual({
            isCover: false,
            leftPage: null,
            rightPage: 5,
            isRightBlank: false,
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
        // spread
        expect(getNextPage(1, 69, true)).toBe(2);
        expect(getNextPage(2, 69, true)).toBe(4);
        expect(getNextPage(68, 69, true)).toBe(68);
        expect(getPrevPage(2, true)).toBe(1);
        expect(getPrevPage(4, true)).toBe(2);

        // single
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
});
