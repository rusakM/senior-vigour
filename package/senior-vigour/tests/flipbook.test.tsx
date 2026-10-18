import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Flipbook } from '../src/components/flipbook/flipbook';
import type { IMaterial } from '../src/types/material';
import * as materialsFunctions from '../src/helpers/materials.functions';

vi.mock('react-pdf', () => ({
    Document: ({ children }: any) => <div data-testid="mock-document">{children}</div>,
    Page: ({ pageNumber, scale }: any) => (
        <div data-testid="mock-page" data-page={pageNumber} data-scale={scale}>
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

describe('Flipbook Component', () => {
    const mockMaterial: IMaterial = {
        name: 'Handbook_PDF',
        category: 'MENTAL_HEALTH',
        translation: 'materials.handbook.mentalHealth',
        type: 'HANDBOOK',
        languages: {
            en: {
                name: 'Handbook_PDF',
                fileExtension: 'pdf',
                pages: 69,
            },
            pl: {
                name: 'Handbook_PDF',
                fileExtension: 'pdf',
                pages: 69,
            },
        },
    };

    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        vi.restoreAllMocks();
        originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            statusText: 'OK',
            blob: async () => new Blob(['dummy pdf content'], { type: 'application/pdf' }),
        } as unknown as Response);

        window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mock-blob-url');
        window.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('renders toolbar buttons and page indicator', async () => {
        render(<Flipbook material={mockMaterial} />);

        expect(screen.getByTestId('flipbook-zoom-out')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-zoom-in')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-prev-page')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-next-page')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-download')).toBeInTheDocument();
        expect(screen.getByTestId('flipbook-close')).toBeInTheDocument();

        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');

        await waitFor(() => {
            expect(screen.getByTestId('mock-document')).toBeInTheDocument();
        });
    });

    it('navigates to next and previous page when buttons are clicked', async () => {
        render(<Flipbook material={mockMaterial} />);

        const prevBtn = screen.getByTestId('flipbook-prev-page');
        const nextBtn = screen.getByTestId('flipbook-next-page');

        // On first page, prev is disabled
        expect(prevBtn).toBeDisabled();

        // Click next
        fireEvent.click(nextBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2/69');
        expect(prevBtn).not.toBeDisabled();

        // Click prev
        fireEvent.click(prevBtn);
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('1/69');
        expect(prevBtn).toBeDisabled();
    });

    it('navigates using ArrowLeft and ArrowRight keyboard shortcuts', async () => {
        render(<Flipbook material={mockMaterial} />);

        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByTestId('flipbook-page-indicator')).toHaveTextContent('2/69');

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
        const downloadSpy = vi.spyOn(materialsFunctions, 'downloadFile').mockImplementation(() => {});
        render(<Flipbook material={mockMaterial} />);

        await waitFor(() => {
            expect(screen.getByTestId('mock-document')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('flipbook-download'));
        expect(downloadSpy).toHaveBeenCalledWith('/cdn/materials/Handbook_PDF/en/Handbook_PDF.pdf');
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
            expect(screen.getByTestId('flipbook-error')).toHaveTextContent('Cannot fetch pdf document.');
        });
    });

    it('revokes cached blob URLs on unmount', async () => {
        const { unmount } = render(<Flipbook material={mockMaterial} />);

        await waitFor(() => {
            expect(window.URL.createObjectURL).toHaveBeenCalled();
        });

        unmount();
        expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mock-blob-url');
    });
});
