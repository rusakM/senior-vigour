import { useState, useEffect, useCallback, useRef, type FC } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import type { IMaterial } from '../../types/material';
import { getCurrentLocale } from '../../translations/utils';
import { getMaterialPageUrl, getMaterialUrl, downloadFile } from '../../helpers/materials.functions';

import BtnNext from '../../assets/icons/right.svg';
import BtnPrev from '../../assets/icons/left.svg';
import BtnClose from '../../assets/icons/x.svg';
import BtnZoomIn from '../../assets/icons/plus.svg';
import BtnZoomOut from '../../assets/icons/minus.svg';
import BtnDownload from '../../assets/icons/download.svg';

import styles from './flipbook.module.scss';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const ZOOM_STEP = 0.2;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3.0;
const DEFAULT_ZOOM = 1.0;
const PREFETCH_PAGES = 2;

async function fetchPdf(url: string, lang: string, page: number): Promise<Blob> {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept-Language': lang,
            'X-Page': String(page),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }

    return response.blob();
}

export interface FlipbookProps {
    material: IMaterial;
    onClose?: () => void;
}

export const Flipbook: FC<FlipbookProps> = ({ material, onClose }) => {
    const lang = getCurrentLocale();
    const totalPages =
        material?.languages?.[lang]?.pages ?? material?.languages?.['en']?.pages ?? 0;

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Cache: page number -> object URL
    const cacheRef = useRef<Map<number, string>>(new Map());
    // Track in-flight fetches to avoid duplicate requests
    const inflightRef = useRef<Set<number>>(new Set());

    const fetchPage = useCallback(
        async (page: number): Promise<string> => {
            const cached = cacheRef.current.get(page);
            if (cached) return cached;

            if (inflightRef.current.has(page)) {
                return new Promise((resolve, reject) => {
                    const interval = setInterval(() => {
                        const url = cacheRef.current.get(page);
                        if (url) {
                            clearInterval(interval);
                            resolve(url);
                        }
                    }, 50);
                    setTimeout(() => {
                        clearInterval(interval);
                        reject(new Error(`Timeout waiting for page ${page}`));
                    }, 10000);
                });
            }

            inflightRef.current.add(page);
            try {
                const url = getMaterialPageUrl(material, lang, page);
                const blob = await fetchPdf(url, lang, page);
                const objectUrl = URL.createObjectURL(blob);
                cacheRef.current.set(page, objectUrl);
                return objectUrl;
            } finally {
                inflightRef.current.delete(page);
            }
        },
        [material, lang]
    );

    // Prevent body scroll when modal is active, and keep Header in view on mobile
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

        document.body.style.overflow = 'hidden';
        if (typeof window !== 'undefined' && typeof window.scrollTo === 'function' && window.innerWidth < 768 && scrollY > 0) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            if (typeof window !== 'undefined' && typeof window.scrollTo === 'function' && scrollY > 0) {
                window.scrollTo({ top: scrollY, behavior: 'instant' });
            }
        };
    }, []);

    // Load current page
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = await fetchPage(currentPage);
                if (!cancelled) setPdfUrl(url);
            } catch (err) {
                if (!cancelled) setError('Cannot fetch pdf document.');
                console.error(err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [currentPage, fetchPage]);

    // Prefetch neighbouring pages silently in background
    useEffect(() => {
        if (!totalPages) return;
        const pagesToPrefetch: number[] = [];

        for (let i = 1; i <= PREFETCH_PAGES; i++) {
            if (currentPage + i <= totalPages) pagesToPrefetch.push(currentPage + i);
            if (currentPage - i >= 1) pagesToPrefetch.push(currentPage - i);
        }

        pagesToPrefetch.forEach((page) => {
            if (!cacheRef.current.has(page) && !inflightRef.current.has(page)) {
                fetchPage(page).catch(() => {
                    // prefetch failures are silent
                });
            }
        });
    }, [currentPage, totalPages, fetchPage]);

    // Revoke all object URLs on unmount
    useEffect(() => {
        const cache = cacheRef.current;
        return () => {
            cache.forEach((url) => URL.revokeObjectURL(url));
            cache.clear();
        };
    }, []);

    const goToPrev = useCallback(() => {
        setCurrentPage((p) => Math.max(1, p - 1));
    }, []);

    const goToNext = useCallback(() => {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
    }, [totalPages]);

    const zoomIn = useCallback(() => {
        setZoom((z) => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(2))));
    }, []);

    const zoomOut = useCallback(() => {
        setZoom((z) => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(2))));
    }, []);

    const handleDownload = useCallback(() => {
        downloadFile(getMaterialUrl(material, lang));
    }, [material, lang]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrev();
            else if (e.key === 'ArrowRight') goToNext();
            else if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrev, goToNext, onClose]);

    return (
        <div
            className={styles.overlay}
            data-testid="flipbook-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div className={styles.modal} data-testid="flipbook-modal">
                <div className={styles.toolbar}>
                    <div className={styles.toolbarLeft}>
                        <button
                            className={styles.iconBtn}
                            onClick={zoomOut}
                            disabled={zoom <= ZOOM_MIN}
                            aria-label="Zoom out"
                            data-testid="flipbook-zoom-out"
                        >
                            <img src={BtnZoomOut} alt="Zoom out" />
                        </button>
                        <button
                            className={styles.iconBtn}
                            onClick={zoomIn}
                            disabled={zoom >= ZOOM_MAX}
                            aria-label="Zoom in"
                            data-testid="flipbook-zoom-in"
                        >
                            <img src={BtnZoomIn} alt="Zoom in" />
                        </button>
                    </div>

                    <div className={styles.toolbarCenter}>
                        <button
                            className={styles.iconBtn}
                            onClick={goToPrev}
                            disabled={currentPage <= 1}
                            aria-label="Prev page"
                            data-testid="flipbook-prev-page"
                        >
                            <img src={BtnPrev} alt="Previous page" />
                        </button>
                        <span className={styles.pageIndicator} data-testid="flipbook-page-indicator">
                            {currentPage}/{totalPages || '—'}
                        </span>
                        <button
                            className={styles.iconBtn}
                            onClick={goToNext}
                            disabled={currentPage >= totalPages}
                            aria-label="Next page"
                            data-testid="flipbook-next-page"
                        >
                            <img src={BtnNext} alt="Next page" />
                        </button>
                    </div>

                    <div className={styles.toolbarRight}>
                        <button
                            className={styles.iconBtn}
                            onClick={handleDownload}
                            aria-label="Download"
                            data-testid="flipbook-download"
                        >
                            <img src={BtnDownload} alt="Download" />
                        </button>
                        <button
                            className={styles.iconBtn}
                            onClick={onClose}
                            aria-label="Close"
                            data-testid="flipbook-close"
                        >
                            <img src={BtnClose} alt="Close" />
                        </button>
                    </div>
                </div>

                <div className={styles.viewer} data-testid="flipbook-viewer">
                    {loading && <div className={styles.status} data-testid="flipbook-loading">Loading...</div>}
                    {error && <div className={styles.status} data-testid="flipbook-error">{error}</div>}
                    {pdfUrl && !loading && !error && (
                        <Document file={pdfUrl} loading={null}>
                            <Page pageNumber={1} scale={zoom} loading={null} />
                        </Document>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Flipbook;
