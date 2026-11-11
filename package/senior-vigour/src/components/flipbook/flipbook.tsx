import {
    useState,
    useEffect,
    useCallback,
    useRef,
    type CSSProperties,
    type FC,
    type ReactNode,
} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import type { IMaterial } from '../../types/material';
import { getCurrentLocale } from '../../translations/utils';
import { getMaterialPageUrl, getMaterialUrl, downloadFile } from '../../helpers/materials.functions';
import {
    FLIP_DURATION_MS,
    isSpreadViewport,
    normalizePageForMode,
    getSpreadState,
    formatPageIndicator,
    getNextPage,
    getPrevPage,
    isNextDisabled,
    isPrevDisabled,
} from './flipbook.helpers';

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
const PREFETCH_PAGES = 6;
const DEFAULT_PAGE_ASPECT = 1.4142; // A4 portrait (height / width)
const SWIPE_THRESHOLD_PX = 50;

type FlipDirection = 'next' | 'prev';

interface FlipState {
    direction: FlipDirection;
    fromPage: number;
    toPage: number;
}

/** Content of a single half of the open book. */
type LeftSlot = number | 'empty';
type RightSlot = number | 'blank';

interface ViewerSize {
    width: number;
    height: number;
}

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

/**
 * Pre-render a page directly to an offscreen image Data URL in the background.
 * This guarantees that when the page is revealed during a page-turn animation,
 * the reader sees real content immediately, exactly like in a physical book.
 */
async function generatePagePreview(
    url: string,
    targetWidth: number = 600,
): Promise<string | null> {
    if (typeof window === 'undefined') {
        return null;
    }
    const pdfjsLib = pdfjs as unknown as {
        getDocument?: (src: string | { url: string }) => {
            promise: Promise<{
                getPage: (num: number) => Promise<{
                    getViewport: (options: { scale: number }) => { width: number; height: number };
                    render: (params: {
                        canvasContext: CanvasRenderingContext2D | null;
                        viewport: { width: number; height: number };
                    }) => { promise: Promise<void> };
                }>;
                destroy?: () => Promise<void>;
            }>;
        };
    };

    if (typeof pdfjsLib.getDocument !== 'function') {
        return null;
    }

    try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const originalViewport = page.getViewport({ scale: 1 });
        const scale = Math.max(
            0.5,
            Math.min(2, targetWidth / (originalViewport.width || targetWidth)),
        );
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const context = canvas.getContext('2d');
        if (!context) {
            return null;
        }

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        if (typeof pdf.destroy === 'function') {
            await pdf.destroy().catch(() => {});
        }
        return dataUrl;
    } catch {
        return null;
    }
}

const getInitialReducedMotion = (): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

const getLeftSlot = (page: number, totalPages: number): LeftSlot => {
    const state = getSpreadState(page, totalPages, true);
    return state.leftPage ?? 'empty';
};

const getRightSlot = (page: number, totalPages: number): RightSlot => {
    const state = getSpreadState(page, totalPages, true);
    return state.rightPage ?? 'blank';
};

interface PageRendererProps {
    pageNumber: number;
    url?: string;
    width?: number;
    scale: number;
    previewUrl?: string;
    onLoadSuccess?: (dims: { originalWidth: number; originalHeight: number }) => void;
    onRenderSuccess?: (pageNumber: number) => void;
    onRegisterContainer?: (pageNumber: number, el: HTMLDivElement | null) => void;
}

const PageRenderer: FC<PageRendererProps> = ({
    pageNumber,
    url,
    width,
    scale,
    previewUrl,
    onLoadSuccess,
    onRenderSuccess,
    onRegisterContainer,
}) => {
    const [isRendered, setIsRendered] = useState<boolean>(false);

    const handleRef = useCallback(
        (el: HTMLDivElement | null) => {
            onRegisterContainer?.(pageNumber, el);
        },
        [onRegisterContainer, pageNumber],
    );

    const handleSuccess = useCallback(() => {
        setIsRendered(true);
        onRenderSuccess?.(pageNumber);
    }, [onRenderSuccess, pageNumber]);

    return (
        <div ref={handleRef} className={styles.pageRenderer}>
            {previewUrl && (
                <img
                    src={previewUrl}
                    alt=""
                    aria-hidden="true"
                    className={styles.pagePreviewImage}
                    style={{ opacity: isRendered ? 0 : 1 }}
                />
            )}
            {url && (
                <div
                    className={styles.pageDocumentWrapper}
                    style={{ opacity: isRendered || !previewUrl ? 1 : 0 }}
                >
                    <Document file={url} loading={null}>
                        <Page
                            pageNumber={1}
                            width={width}
                            scale={scale}
                            loading={null}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            onLoadSuccess={onLoadSuccess}
                            onRenderSuccess={handleSuccess}
                        />
                    </Document>
                </div>
            )}
        </div>
    );
};

export interface FlipbookProps {
    material: IMaterial;
    onClose?: () => void;
}

export const Flipbook: FC<FlipbookProps> = ({ material, onClose }) => {
    const lang = getCurrentLocale();
    const totalPages =
        material?.languages?.[lang]?.pages ?? material?.languages?.['en']?.pages ?? 0;

    const [isSpread, setIsSpread] = useState<boolean>(() =>
        isSpreadViewport(typeof window !== 'undefined' ? window.innerWidth : 1440),
    );
    const [reducedMotion, setReducedMotion] = useState<boolean>(getInitialReducedMotion);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
    const [pageUrls, setPageUrls] = useState<Record<number, string>>({});
    const [pagePreviews, setPagePreviews] = useState<Record<number, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [flip, setFlip] = useState<FlipState | null>(null);
    const [viewerSize, setViewerSize] = useState<ViewerSize | null>(null);
    const [pageAspect, setPageAspect] = useState<number>(DEFAULT_PAGE_ASPECT);

    // Cache: page number -> object URL
    const cacheRef = useRef<Map<number, string>>(new Map());
    // Pre-rendered previews: page number -> image Data URL
    const previewCacheRef = useRef<Map<number, string>>(new Map());
    const pageContainersRef = useRef<Map<number, HTMLDivElement | null>>(new Map());
    // Track in-flight fetches to avoid duplicate requests
    const inflightRef = useRef<Set<number>>(new Set());
    // Timer for 3D flip animation
    const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    // Gesture tracking
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const mouseStartRef = useRef<{ x: number; y: number } | null>(null);
    // Focus management
    const previousActiveElementRef = useRef<HTMLElement | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const viewerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        previousActiveElementRef.current = document.activeElement as HTMLElement | null;
        modalRef.current?.focus();
        return () => {
            previousActiveElementRef.current?.focus?.();
        };
    }, []);

    // Measure available viewer space to fit pages without cropping or stretching
    useEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer || typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect;
            if (!rect) return;
            setViewerSize((prev) =>
                prev && prev.width === rect.width && prev.height === rect.height
                    ? prev
                    : { width: rect.width, height: rect.height },
            );
        });
        observer.observe(viewer);
        return () => observer.disconnect();
    }, []);

    // Listen to prefers-reduced-motion media query
    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handler = (event: MediaQueryListEvent) => {
            setReducedMotion(event.matches);
        };

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handler);
        } else if (mediaQuery.addListener) {
            mediaQuery.addListener(handler);
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handler);
            } else if (mediaQuery.removeListener) {
                mediaQuery.removeListener(handler);
            }
        };
    }, []);

    // Listen to window resize and synchronize spread/single modes
    useEffect(() => {
        const handleResize = () => {
            const newIsSpread = isSpreadViewport(window.innerWidth);
            setIsSpread(newIsSpread);
            if (newIsSpread) {
                setCurrentPage((p) => normalizePageForMode(p, totalPages, true));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [totalPages]);

    // Prevent body scroll when modal is active, and keep Header in view on mobile
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

        document.body.style.overflow = 'hidden';
        if (
            typeof window !== 'undefined' &&
            typeof window.scrollTo === 'function' &&
            window.innerWidth < 768 &&
            scrollY > 0
        ) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            if (
                typeof window !== 'undefined' &&
                typeof window.scrollTo === 'function' &&
                scrollY > 0
            ) {
                window.scrollTo({ top: scrollY, behavior: 'instant' });
            }
        };
    }, []);

    // Fetch a single page blob and create an object URL
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
        [material, lang],
    );

    const storePageUrls = useCallback((loaded: { page: number; url: string }[]) => {
        setPageUrls((prev) => {
            let hasChange = false;
            const next = { ...prev };
            for (const item of loaded) {
                if (next[item.page] !== item.url) {
                    next[item.page] = item.url;
                    hasChange = true;
                }
            }
            return hasChange ? next : prev;
        });
    }, []);

    // Revoke all object URLs and clear timers on unmount
    useEffect(() => {
        const cache = cacheRef.current;
        return () => {
            cache.forEach((url) => URL.revokeObjectURL(url));
            cache.clear();
            if (flipTimerRef.current) {
                clearTimeout(flipTimerRef.current);
                flipTimerRef.current = null;
            }
        };
    }, []);

    const captureCurrentVisiblePages = useCallback(() => {
        try {
            const updates: Record<number, string> = {};
            pageContainersRef.current.forEach((container, pageNumber) => {
                if (container) {
                    const canvas = container.querySelector('canvas');
                    if (canvas && canvas.width > 0 && canvas.height > 0) {
                        try {
                            const dataUrl = canvas.toDataURL('image/png');
                            updates[pageNumber] = dataUrl;
                        } catch {
                            // ignore tainted canvas
                        }
                    }
                }
            });
            if (Object.keys(updates).length > 0) {
                setPagePreviews((prev) => ({ ...prev, ...updates }));
            }
        } catch {
            // silent
        }
    }, []);

    /**
     * Turns the page. The target page (and page indicator) is committed immediately,
     * while the flip overlay keeps rendering the "from" page on its front face and
     * the "to" page on its back face for FLIP_DURATION_MS. A new navigation during
     * an ongoing flip instantly finishes the previous one and starts a new flip.
     */
    const navigate = useCallback(
        (direction: FlipDirection) => {
            let target = currentPage;
            if (direction === 'next') {
                if (!isNextDisabled(currentPage, totalPages, isSpread)) {
                    target = getNextPage(currentPage, totalPages, isSpread);
                }
            } else if (!isPrevDisabled(currentPage)) {
                target = getPrevPage(currentPage, isSpread);
            }
            if (target === currentPage) return;

            captureCurrentVisiblePages();

            if (flipTimerRef.current) {
                clearTimeout(flipTimerRef.current);
                flipTimerRef.current = null;
            }

            if (reducedMotion) {
                setFlip(null);
            } else {
                setFlip({ direction, fromPage: currentPage, toPage: target });
                flipTimerRef.current = setTimeout(() => {
                    setFlip(null);
                    flipTimerRef.current = null;
                }, FLIP_DURATION_MS + 20);
            }

            setCurrentPage(target);
        },
        [currentPage, totalPages, isSpread, reducedMotion, captureCurrentVisiblePages],
    );

    const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
        if (e.target !== e.currentTarget) return;
        if (flipTimerRef.current) {
            clearTimeout(flipTimerRef.current);
            flipTimerRef.current = null;
        }
        setFlip(null);
    }, []);

    const goToPrev = useCallback(() => navigate('prev'), [navigate]);
    const goToNext = useCallback(() => navigate('next'), [navigate]);

    // Edge clicking navigation (only when zoom <= DEFAULT_ZOOM)
    const handleEdgePrev = useCallback(() => {
        if (zoom > DEFAULT_ZOOM) return;
        goToPrev();
    }, [zoom, goToPrev]);

    const handleEdgeNext = useCallback(() => {
        if (zoom > DEFAULT_ZOOM) return;
        goToNext();
    }, [zoom, goToNext]);

    const handleGesture = useCallback(
        (deltaX: number, deltaY: number) => {
            if (
                Math.abs(deltaX) > SWIPE_THRESHOLD_PX &&
                Math.abs(deltaX) > Math.abs(deltaY) * 1.2
            ) {
                if (deltaX < 0) {
                    goToNext();
                } else {
                    goToPrev();
                }
            }
        },
        [goToNext, goToPrev],
    );

    // Touch swipe gestures (only when zoom <= DEFAULT_ZOOM)
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (zoom > DEFAULT_ZOOM) return;
            const touch = e.changedTouches[0];
            if (touch) {
                touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            }
        },
        [zoom],
    );

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (zoom > DEFAULT_ZOOM || !touchStartRef.current) return;
            const touch = e.changedTouches[0];
            if (!touch) return;
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;
            touchStartRef.current = null;
            handleGesture(deltaX, deltaY);
        },
        [zoom, handleGesture],
    );

    // Desktop mouse drag gestures (only when zoom <= DEFAULT_ZOOM)
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (zoom > DEFAULT_ZOOM) return;
            if (e.button !== 0) return;
            mouseStartRef.current = { x: e.clientX, y: e.clientY };
        },
        [zoom],
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            if (zoom > DEFAULT_ZOOM || !mouseStartRef.current) return;
            const deltaX = e.clientX - mouseStartRef.current.x;
            const deltaY = e.clientY - mouseStartRef.current.y;
            mouseStartRef.current = null;
            handleGesture(deltaX, deltaY);
        },
        [zoom, handleGesture],
    );

    // Zoom handlers
    const zoomIn = useCallback(() => {
        setZoom((z) => Math.min(ZOOM_MAX, parseFloat((z + ZOOM_STEP).toFixed(2))));
    }, []);

    const zoomOut = useCallback(() => {
        setZoom((z) => Math.max(ZOOM_MIN, parseFloat((z - ZOOM_STEP).toFixed(2))));
    }, []);

    // Download handler
    const handleDownload = useCallback(() => {
        downloadFile(getMaterialUrl(material, lang));
    }, [material, lang]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToPrev();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'Escape') {
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goToPrev, goToNext, onClose]);

    // Load visible pages for the active view
    useEffect(() => {
        let cancelled = false;

        const spreadState = getSpreadState(currentPage, totalPages, isSpread);
        let pagesToLoad: number[] = [];

        if (!isSpread) {
            pagesToLoad = [currentPage];
        } else if (spreadState.isCover) {
            pagesToLoad = [1];
        } else {
            pagesToLoad = [spreadState.leftPage, spreadState.rightPage].filter(
                (p): p is number => p !== null,
            );
        }

        const load = async () => {
            setError(null);
            try {
                const loaded = await Promise.all(
                    pagesToLoad.map(async (p) => ({ page: p, url: await fetchPage(p) })),
                );
                if (!cancelled) storePageUrls(loaded);
            } catch (err) {
                if (!cancelled) {
                    setError('Cannot fetch pdf document.');
                }
                console.error(err);
            }
        };

        if (pagesToLoad.length > 0) {
            load();
        }

        return () => {
            cancelled = true;
        };
    }, [currentPage, isSpread, totalPages, fetchPage, storePageUrls]);

    const handlePageLoad = useCallback(
        ({ originalWidth, originalHeight }: { originalWidth: number; originalHeight: number }) => {
            if (!originalWidth || !originalHeight) return;
            const aspect = originalHeight / originalWidth;
            setPageAspect((prev) => (Math.abs(prev - aspect) < 0.001 ? prev : aspect));
        },
        [],
    );

    // ---- Layout: fit pages into the viewer while preserving the PDF aspect ratio ----
    const columns = isSpread ? 2 : 1;
    const basePageWidth = viewerSize
        ? Math.max(
              120,
              Math.floor(Math.min(viewerSize.width / columns, viewerSize.height / pageAspect)),
          )
        : undefined;
    const sheetStyle: CSSProperties | undefined = basePageWidth
        ? {
              width: Math.round(basePageWidth * zoom),
              height: Math.round(basePageWidth * pageAspect * zoom),
          }
        : undefined;
    const isZoomed = zoom > DEFAULT_ZOOM;

    // Prefetch neighbouring pages in the background, so flipped leaves have content ready
    useEffect(() => {
        if (!totalPages) return;
        let cancelled = false;
        const pagesToPrefetch: number[] = [];

        for (let i = 1; i <= PREFETCH_PAGES; i++) {
            if (currentPage + i <= totalPages) pagesToPrefetch.push(currentPage + i);
            if (currentPage - i >= 1) pagesToPrefetch.push(currentPage - i);
        }

        pagesToPrefetch.forEach((page) => {
            fetchPage(page)
                .then(async (url) => {
                    if (cancelled) return;
                    storePageUrls([{ page, url }]);
                    if (!previewCacheRef.current.has(page)) {
                        const previewUrl = await generatePagePreview(
                            url,
                            basePageWidth || 600,
                        );
                        if (!cancelled && previewUrl) {
                            previewCacheRef.current.set(page, previewUrl);
                            setPagePreviews((prev) =>
                                prev[page] ? prev : { ...prev, [page]: previewUrl },
                            );
                        }
                    }
                })
                .catch(() => {
                    // prefetch failures are silent
                });
        });

        return () => {
            cancelled = true;
        };
    }, [currentPage, totalPages, fetchPage, storePageUrls, basePageWidth]);

    const handleRegisterContainer = useCallback((pageNumber: number, el: HTMLDivElement | null) => {
        if (el) {
            pageContainersRef.current.set(pageNumber, el);
        } else {
            pageContainersRef.current.delete(pageNumber);
        }
    }, []);

    const handlePageRenderSuccess = useCallback((pageNumber: number) => {
        try {
            const container = pageContainersRef.current.get(pageNumber);
            const canvas = container?.querySelector('canvas');
            if (canvas && canvas.width > 0 && canvas.height > 0) {
                const dataUrl = canvas.toDataURL('image/png');
                previewCacheRef.current.set(pageNumber, dataUrl);
                setPagePreviews((prev) => {
                    if (prev[pageNumber]) return prev;
                    return { ...prev, [pageNumber]: dataUrl };
                });
            }
        } catch {
            // silent
        }
    }, []);

    const renderPdfPage = (page: number): ReactNode => {
        const url = pageUrls[page];
        return (
            <PageRenderer
                key={`${page}-${zoom}`}
                pageNumber={page}
                url={url}
                width={basePageWidth}
                scale={zoom}
                previewUrl={pagePreviews[page]}
                onLoadSuccess={handlePageLoad}
                onRenderSuccess={handlePageRenderSuccess}
                onRegisterContainer={handleRegisterContainer}
            />
        );
    };

    // ---- What is visible under the flipping leaf ----
    const activeFlip = flip && !reducedMotion ? flip : null;

    let baseLeft: LeftSlot = 'empty';
    let baseRight: RightSlot = 'blank';
    let leafFront: number | 'blank' | 'empty' = 'blank';
    let leafBack: number | 'blank' | 'empty' = 'blank';

    if (isSpread) {
        if (activeFlip) {
            const { fromPage, toPage, direction } = activeFlip;
            if (direction === 'next') {
                baseLeft = getLeftSlot(fromPage, totalPages);
                baseRight = getRightSlot(toPage, totalPages);
                leafFront = getRightSlot(fromPage, totalPages);
                leafBack = getLeftSlot(toPage, totalPages);
            } else {
                baseLeft = getLeftSlot(toPage, totalPages);
                baseRight = getRightSlot(fromPage, totalPages);
                leafFront = getLeftSlot(fromPage, totalPages);
                leafBack = getRightSlot(toPage, totalPages);
            }
        } else {
            baseLeft = getLeftSlot(currentPage, totalPages);
            baseRight = getRightSlot(currentPage, totalPages);
        }
    }

    // In single-page mode: "next" lifts the old page away revealing the new one,
    // "prev" lays the previous page back down on top of the current one.
    const singleBasePage =
        activeFlip && activeFlip.direction === 'prev' ? activeFlip.fromPage : currentPage;
    if (!isSpread && activeFlip) {
        leafFront = activeFlip.direction === 'next' ? activeFlip.fromPage : activeFlip.toPage;
        leafBack = 'blank';
    }

    const renderLeafFace = (content: number | 'blank' | 'empty'): ReactNode =>
        typeof content === 'number' ? renderPdfPage(content) : null;

    const leafClassName = [
        styles.flippingLeaf,
        isSpread ? styles.leafSpread : styles.leafSingle,
        activeFlip?.direction === 'prev' ? styles.leafPrev : styles.leafNext,
    ].join(' ');

    const bookStyle = { '--flip-duration': `${FLIP_DURATION_MS}ms` } as CSSProperties;
    const isBookOpen = baseLeft !== 'empty';

    return (
        <div
            className={styles.overlay}
            data-testid="flipbook-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            <div
                className={styles.modal}
                data-testid="flipbook-modal"
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-label="Podgląd dokumentu"
                tabIndex={-1}
            >
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
                            disabled={isPrevDisabled(currentPage)}
                            aria-label="Prev page"
                            data-testid="flipbook-prev-page"
                        >
                            <img src={BtnPrev} alt="Previous page" />
                        </button>
                        <span
                            className={styles.pageIndicator}
                            data-testid="flipbook-page-indicator"
                            aria-live="polite"
                        >
                            {formatPageIndicator(currentPage, totalPages, isSpread)}
                        </span>
                        <button
                            className={styles.iconBtn}
                            onClick={goToNext}
                            disabled={isNextDisabled(currentPage, totalPages, isSpread)}
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

                <div
                    className={`${styles.viewer} ${isZoomed ? styles.viewerZoomed : ''}`}
                    data-testid="flipbook-viewer"
                    ref={viewerRef}
                >
                    {error ? (
                        <div className={styles.status} data-testid="flipbook-error">
                            {error}
                        </div>
                    ) : (
                        <div
                            className={styles.book}
                            style={bookStyle}
                            data-testid="flipbook-book"
                            data-mode={isSpread ? 'spread' : 'single'}
                            data-reduced-motion={reducedMotion ? 'true' : 'false'}
                            data-zoomed={isZoomed ? 'true' : 'false'}
                            onTouchStart={handleTouchStart}
                            onTouchEnd={handleTouchEnd}
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                        >
                            <button
                                type="button"
                                className={styles.edgePrev}
                                data-testid="flipbook-edge-prev"
                                onClick={handleEdgePrev}
                                disabled={isPrevDisabled(currentPage) || isZoomed}
                                aria-label="Previous page edge"
                                tabIndex={-1}
                            />
                            <button
                                type="button"
                                className={styles.edgeNext}
                                data-testid="flipbook-edge-next"
                                onClick={handleEdgeNext}
                                disabled={
                                    isNextDisabled(currentPage, totalPages, isSpread) || isZoomed
                                }
                                aria-label="Next page edge"
                                tabIndex={-1}
                            />

                            {isSpread ? (
                                <div
                                    className={`${styles.spreadContainer} ${
                                        isBookOpen ? styles.spreadOpen : styles.spreadClosed
                                    }`}
                                >
                                    {/* Left half */}
                                    {baseLeft === 'empty' ? (
                                        <div
                                            className={styles.emptyHalf}
                                            style={sheetStyle}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <div
                                            className={styles.pageSheetLeft}
                                            style={sheetStyle}
                                            data-testid="flipbook-left-page"
                                            data-page-number={String(baseLeft)}
                                        >
                                            {typeof baseLeft === 'number' && renderPdfPage(baseLeft)}
                                        </div>
                                    )}

                                    {/* Right half */}
                                    {baseRight === 'blank' ? (
                                        <div
                                            className={styles.blankPage}
                                            style={sheetStyle}
                                            data-testid="flipbook-blank-page"
                                            aria-hidden="true"
                                        />
                                    ) : baseRight === 1 ? (
                                        <div
                                            className={styles.coverSheet}
                                            style={sheetStyle}
                                            data-testid="flipbook-cover-sheet"
                                            data-page-number="1"
                                        >
                                            {renderPdfPage(1)}
                                        </div>
                                    ) : (
                                        <div
                                            className={styles.pageSheetRight}
                                            style={sheetStyle}
                                            data-testid="flipbook-right-page"
                                            data-page-number={String(baseRight)}
                                        >
                                            {typeof baseRight === 'number' && renderPdfPage(baseRight)}
                                        </div>
                                    )}

                                    {isBookOpen && (
                                        <div
                                            className={styles.bookSpine}
                                            data-testid="flipbook-spine"
                                            aria-hidden="true"
                                        />
                                    )}

                                    {activeFlip && (
                                        <div
                                            className={`${styles.underShade} ${
                                                activeFlip.direction === 'next'
                                                    ? styles.underShadeRight
                                                    : styles.underShadeLeft
                                            }`}
                                            aria-hidden="true"
                                        />
                                    )}

                                    {activeFlip && (
                                        <div
                                            key={`${activeFlip.fromPage}-${activeFlip.toPage}`}
                                            className={leafClassName}
                                            data-testid="flipbook-flipping-leaf"
                                            data-direction={activeFlip.direction}
                                            aria-hidden="true"
                                            onAnimationEnd={handleAnimationEnd}
                                        >
                                            <div
                                                className={`${styles.leafFace} ${styles.leafFront} ${
                                                    leafFront === 1 ? styles.leafCover : ''
                                                }`}
                                            >
                                                {renderLeafFace(leafFront)}
                                                <div className={styles.leafShade} />
                                            </div>
                                            <div
                                                className={`${styles.leafFace} ${styles.leafBack} ${
                                                    leafBack === 1 ? styles.leafCover : ''
                                                }`}
                                            >
                                                {renderLeafFace(leafBack)}
                                                <div className={styles.leafShade} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className={styles.singleContainer}>
                                    <div
                                        className={styles.singlePageSheet}
                                        style={sheetStyle}
                                        data-testid="flipbook-single-page"
                                        data-page-number={String(singleBasePage)}
                                    >
                                        {renderPdfPage(singleBasePage)}
                                    </div>

                                    {activeFlip && (
                                        <div
                                            key={`${activeFlip.fromPage}-${activeFlip.toPage}`}
                                            className={leafClassName}
                                            data-testid="flipbook-flipping-leaf"
                                            data-direction={activeFlip.direction}
                                            aria-hidden="true"
                                            onAnimationEnd={handleAnimationEnd}
                                        >
                                            <div
                                                className={`${styles.leafFace} ${styles.leafFront}`}
                                            >
                                                {renderLeafFace(leafFront)}
                                                <div className={styles.leafShade} />
                                            </div>
                                            <div
                                                className={`${styles.leafFace} ${styles.leafBack}`}
                                            >
                                                {renderLeafFace(leafBack)}
                                                <div className={styles.leafShade} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Flipbook;
