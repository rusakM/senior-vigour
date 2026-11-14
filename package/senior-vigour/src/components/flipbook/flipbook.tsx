import {
    useState,
    useEffect,
    useLayoutEffect,
    useCallback,
    useRef,
    type CSSProperties,
    type FC,
    type ReactNode,
} from 'react';
import { useTranslate } from '@tolgee/react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import type { IMaterial } from '../../types/material';
import { getCurrentLocale } from '../../translations/utils';
import { useAccessibility } from '../../context/accessibility-context';
import { AccessibilityTrigger } from '../accessibility-widget/accessibility-widget';
import { getMaterialPageUrl, getMaterialUrl, downloadFile } from '../../helpers/materials.functions';
import {
    FLIP_DURATION_MS,
    ZOOM_MIN,
    ZOOM_MAX,
    DEFAULT_ZOOM,
    isSpreadViewport,
    normalizePageForMode,
    getLastPage,
    getSpreadState,
    formatPageIndicator,
    getNextPage,
    getPrevPage,
    isNextDisabled,
    isPrevDisabled,
    stepZoom,
    clampZoom,
    calculateZoomScrollAnchor,
    clampScrollPosition,
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

const PREFETCH_PAGES = 6;
const DEFAULT_PAGE_ASPECT = 1.4142; // A4 portrait (height / width)
const SWIPE_THRESHOLD_PX = 50;

type FlipDirection = 'next' | 'prev';

interface FlipState {
    direction: FlipDirection;
    fromPage: number;
    toPage: number;
}

/** Content of a single half during transitions or open spreads. */
type SlotContent = number | 'empty';

interface ViewerSize {
    width: number;
    height: number;
}

interface PendingZoomAnchor {
    currentScrollLeft: number;
    currentScrollTop: number;
    prevContentWidth: number;
    prevContentHeight: number;
    prevZoom: number;
    nextZoom: number;
    anchorX: number;
    anchorY: number;
    viewportWidth: number;
    viewportHeight: number;
}

interface PanStartState {
    startX: number;
    startY: number;
    startScrollLeft: number;
    startScrollTop: number;
}

interface PinchStartState {
    distance: number;
    startZoom: number;
    midClientX: number;
    midClientY: number;
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
 * Pre-renders a PDF page onto an offscreen canvas image so flipped pages
 * display crisp visual content immediately before react-pdf finishes mounting.
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
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const scale = Math.max(
            0.5,
            Math.min(2.5, (targetWidth * dpr) / (originalViewport.width || targetWidth)),
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
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
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

interface PageRendererProps {
    pageNumber: number;
    url?: string;
    width?: number;
    scale: number;
    previewUrl?: string;
    renderTextLayer?: boolean;
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
    renderTextLayer = true,
    onLoadSuccess,
    onRenderSuccess,
    onRegisterContainer,
}) => {
    const [renderedUrl, setRenderedUrl] = useState<string | undefined>(undefined);
    const isRendered = Boolean(url) && renderedUrl === url;

    const handleRef = useCallback(
        (el: HTMLDivElement | null) => {
            onRegisterContainer?.(pageNumber, el);
        },
        [onRegisterContainer, pageNumber],
    );

    const handleSuccess = useCallback(() => {
        setRenderedUrl(url);
        onRenderSuccess?.(pageNumber);
    }, [onRenderSuccess, pageNumber, url]);

    // Cap DPR slightly at extreme zoom levels to prevent runaway canvas memory usage
    const baseDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const cappedDpr = Math.min(baseDpr, scale >= 2.5 ? 1.5 : 2);

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
                            devicePixelRatio={cappedDpr}
                            loading={null}
                            renderTextLayer={renderTextLayer}
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
    const { t } = useTranslate();
    const {
        preferences: a11yPreferences,
        isPanelOpen: isA11yPanelOpen,
    } = useAccessibility();
    const lang = getCurrentLocale();
    const totalPages =
        material?.languages?.[lang]?.pages ?? material?.languages?.['en']?.pages ?? 0;

    const [isSpread, setIsSpread] = useState<boolean>(() =>
        isSpreadViewport(typeof window !== 'undefined' ? window.innerWidth : 1440),
    );
    const [osReducedMotion, setOsReducedMotion] = useState<boolean>(getInitialReducedMotion);
    const reducedMotion = osReducedMotion || a11yPreferences.reducedMotion;
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [isSwipeDragging, setIsSwipeDragging] = useState<boolean>(false);
    const [pageUrls, setPageUrls] = useState<Record<number, string>>({});
    const [pagePreviews, setPagePreviews] = useState<Record<number, string>>({});
    const [error, setError] = useState<string | null>(null);
    const [flip, setFlip] = useState<FlipState | null>(null);
    const [viewerSize, setViewerSize] = useState<ViewerSize | null>(null);
    const [pageAspect, setPageAspect] = useState<number>(DEFAULT_PAGE_ASPECT);

    const cacheRef = useRef<Map<number, string>>(new Map());
    const previewCacheRef = useRef<Map<number, string>>(new Map());
    const pageContainersRef = useRef<Map<number, HTMLDivElement | null>>(new Map());
    const inflightPromisesRef = useRef<Map<number, Promise<string>>>(new Map());
    const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    const mouseSwipeStartRef = useRef<{ x: number; y: number } | null>(null);
    const panStartRef = useRef<PanStartState | null>(null);
    const touchPanRef = useRef<PanStartState | null>(null);
    const pinchStartRef = useRef<PinchStartState | null>(null);
    const pendingZoomAnchorRef = useRef<PendingZoomAnchor | null>(null);

    const previousActiveElementRef = useRef<HTMLElement | null>(null);
    const modalRef = useRef<HTMLDivElement | null>(null);
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const bookRef = useRef<HTMLDivElement | null>(null);

    const isZoomed = zoom > DEFAULT_ZOOM;

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
            setOsReducedMotion(event.matches);
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

    // Synchronize spread vs single mode on viewport resize
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

    // Lock body scroll under the modal
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

    // Deduplicated page fetching without polling timers
    const fetchPage = useCallback(
        (page: number): Promise<string> => {
            const cached = cacheRef.current.get(page);
            if (cached) return Promise.resolve(cached);

            const inflight = inflightPromisesRef.current.get(page);
            if (inflight) return inflight;

            const request = (async () => {
                try {
                    const url = getMaterialPageUrl(material, lang, page);
                    const blob = await fetchPdf(url, lang, page);
                    const objectUrl = URL.createObjectURL(blob);
                    cacheRef.current.set(page, objectUrl);
                    return objectUrl;
                } finally {
                    inflightPromisesRef.current.delete(page);
                }
            })();

            inflightPromisesRef.current.set(page, request);
            return request;
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

    // Cleanup cached blob URLs and active animation timer on unmount
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

    const navigateToPage = useCallback(
        (target: number, direction: FlipDirection) => {
            if (target === currentPage) return;

            captureCurrentVisiblePages();

            // Reset zoom back to fit-to-screen cleanly on page turn
            if (zoom > DEFAULT_ZOOM) {
                pendingZoomAnchorRef.current = null;
                setZoom(DEFAULT_ZOOM);
                setIsPanning(false);
                panStartRef.current = null;
            }

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
        [currentPage, zoom, reducedMotion, captureCurrentVisiblePages],
    );

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
            navigateToPage(target, direction);
        },
        [currentPage, totalPages, isSpread, navigateToPage],
    );

    const goToPrev = useCallback(() => navigate('prev'), [navigate]);
    const goToNext = useCallback(() => navigate('next'), [navigate]);

    const goToFirst = useCallback(() => {
        if (currentPage > 1) {
            navigateToPage(1, 'prev');
        }
    }, [currentPage, navigateToPage]);

    const goToLast = useCallback(() => {
        const last = getLastPage(totalPages, isSpread);
        if (last > currentPage) {
            navigateToPage(last, 'next');
        }
    }, [currentPage, totalPages, isSpread, navigateToPage]);

    const handleAnimationEnd = useCallback((e: React.AnimationEvent) => {
        if (e.target !== e.currentTarget) return;
        if (flipTimerRef.current) {
            clearTimeout(flipTimerRef.current);
            flipTimerRef.current = null;
        }
        setFlip(null);
    }, []);

    // Apply zoom anchored either to viewport center or cursor coordinates
    const applyZoom = useCallback(
        (targetZoom: number, clientPoint?: { clientX: number; clientY: number }) => {
            const clampedNext = clampZoom(targetZoom);
            if (clampedNext === zoom) return;

            const viewer = viewerRef.current;
            const book = bookRef.current;

            if (clampedNext <= DEFAULT_ZOOM) {
                pendingZoomAnchorRef.current = null;
                setIsPanning(false);
                panStartRef.current = null;
            } else if (viewer && book) {
                const viewerRect = viewer.getBoundingClientRect();
                const anchorX = clientPoint
                    ? clientPoint.clientX - viewerRect.left
                    : viewer.clientWidth / 2;
                const anchorY = clientPoint
                    ? clientPoint.clientY - viewerRect.top
                    : viewer.clientHeight / 2;

                pendingZoomAnchorRef.current = {
                    currentScrollLeft: viewer.scrollLeft,
                    currentScrollTop: viewer.scrollTop,
                    prevContentWidth: book.offsetWidth || viewer.scrollWidth,
                    prevContentHeight: book.offsetHeight || viewer.scrollHeight,
                    prevZoom: zoom,
                    nextZoom: clampedNext,
                    anchorX,
                    anchorY,
                    viewportWidth: viewer.clientWidth,
                    viewportHeight: viewer.clientHeight,
                };
            }

            setZoom(clampedNext);
        },
        [zoom],
    );

    const zoomIn = useCallback(() => {
        applyZoom(stepZoom(zoom, 1));
    }, [applyZoom, zoom]);

    const zoomOut = useCallback(() => {
        applyZoom(stepZoom(zoom, -1));
    }, [applyZoom, zoom]);

    const resetZoom = useCallback(() => {
        applyZoom(DEFAULT_ZOOM);
    }, [applyZoom]);

    // Synchronize scroll offset after zoom layout commits so focal point stays stable
    useLayoutEffect(() => {
        const viewer = viewerRef.current;
        if (!viewer) return;

        if (zoom <= DEFAULT_ZOOM) {
            viewer.scrollLeft = 0;
            viewer.scrollTop = 0;
            pendingZoomAnchorRef.current = null;
            return;
        }

        const anchor = pendingZoomAnchorRef.current;
        if (!anchor) return;
        pendingZoomAnchorRef.current = null;

        const ratio = anchor.nextZoom / Math.max(0.01, anchor.prevZoom);
        const book = bookRef.current;
        const nextWidth = book?.offsetWidth || anchor.prevContentWidth * ratio;
        const nextHeight = book?.offsetHeight || anchor.prevContentHeight * ratio;

        const { nextScrollLeft, nextScrollTop } = calculateZoomScrollAnchor({
            currentScrollLeft: anchor.currentScrollLeft,
            currentScrollTop: anchor.currentScrollTop,
            prevContentWidth: anchor.prevContentWidth,
            prevContentHeight: anchor.prevContentHeight,
            nextContentWidth: nextWidth,
            nextContentHeight: nextHeight,
            anchorX: anchor.anchorX,
            anchorY: anchor.anchorY,
            viewportWidth: viewer.clientWidth || anchor.viewportWidth,
            viewportHeight: viewer.clientHeight || anchor.viewportHeight,
        });

        viewer.scrollLeft = nextScrollLeft;
        viewer.scrollTop = nextScrollTop;
    }, [zoom, viewerSize]);

    // Window-level mouse drag listeners for smooth multi-axis panning when zoomed
    useEffect(() => {
        if (!isPanning) return;

        const handleWindowMouseMove = (e: MouseEvent) => {
            const viewer = viewerRef.current;
            const pan = panStartRef.current;
            if (!viewer || !pan) return;

            const deltaX = e.clientX - pan.startX;
            const deltaY = e.clientY - pan.startY;
            const clamped = clampScrollPosition(
                pan.startScrollLeft - deltaX,
                pan.startScrollTop - deltaY,
                viewer.scrollWidth,
                viewer.scrollHeight,
                viewer.clientWidth,
                viewer.clientHeight,
            );
            viewer.scrollLeft = clamped.scrollLeft;
            viewer.scrollTop = clamped.scrollTop;
        };

        const handleWindowMouseUp = () => {
            panStartRef.current = null;
            setIsPanning(false);
        };

        window.addEventListener('mousemove', handleWindowMouseMove);
        window.addEventListener('mouseup', handleWindowMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isPanning]);

    // Edge click navigation (active only at default fit-to-screen zoom)
    const handleEdgePrev = useCallback(() => {
        if (isZoomed) return;
        goToPrev();
    }, [isZoomed, goToPrev]);

    const handleEdgeNext = useCallback(() => {
        if (isZoomed) return;
        goToNext();
    }, [isZoomed, goToNext]);

    const handleSwipeGesture = useCallback(
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

    // Touch handling: 2-finger pinch zoom, 1-finger pan when zoomed, 1-finger swipe at zoom 1
    const handleTouchStart = useCallback(
        (e: React.TouchEvent) => {
            if (e.touches.length === 2) {
                const t0 = e.touches[0];
                const t1 = e.touches[1];
                pinchStartRef.current = {
                    distance: Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY),
                    startZoom: zoom,
                    midClientX: (t0.clientX + t1.clientX) / 2,
                    midClientY: (t0.clientY + t1.clientY) / 2,
                };
                touchStartRef.current = null;
                touchPanRef.current = null;
                return;
            }

            const touch = e.changedTouches[0];
            if (!touch) return;

            if (isZoomed) {
                const viewer = viewerRef.current;
                if (viewer) {
                    touchPanRef.current = {
                        startX: touch.clientX,
                        startY: touch.clientY,
                        startScrollLeft: viewer.scrollLeft,
                        startScrollTop: viewer.scrollTop,
                    };
                }
            } else {
                touchStartRef.current = { x: touch.clientX, y: touch.clientY };
            }
        },
        [zoom, isZoomed],
    );

    const handleTouchMove = useCallback(
        (e: React.TouchEvent) => {
            if (e.touches.length === 2 && pinchStartRef.current) {
                const t0 = e.touches[0];
                const t1 = e.touches[1];
                const currentDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
                if (pinchStartRef.current.distance > 0) {
                    const nextZoom = clampZoom(
                        pinchStartRef.current.startZoom *
                            (currentDist / pinchStartRef.current.distance),
                    );
                    applyZoom(nextZoom, {
                        clientX: (t0.clientX + t1.clientX) / 2,
                        clientY: (t0.clientY + t1.clientY) / 2,
                    });
                }
                return;
            }

            if (isZoomed && touchPanRef.current && e.changedTouches[0]) {
                const viewer = viewerRef.current;
                if (!viewer) return;
                const touch = e.changedTouches[0];
                const deltaX = touch.clientX - touchPanRef.current.startX;
                const deltaY = touch.clientY - touchPanRef.current.startY;
                const clamped = clampScrollPosition(
                    touchPanRef.current.startScrollLeft - deltaX,
                    touchPanRef.current.startScrollTop - deltaY,
                    viewer.scrollWidth,
                    viewer.scrollHeight,
                    viewer.clientWidth,
                    viewer.clientHeight,
                );
                viewer.scrollLeft = clamped.scrollLeft;
                viewer.scrollTop = clamped.scrollTop;
            }
        },
        [isZoomed, applyZoom],
    );

    const handleTouchEnd = useCallback(
        (e: React.TouchEvent) => {
            if (pinchStartRef.current) {
                if (e.touches.length < 2) {
                    pinchStartRef.current = null;
                }
                return;
            }

            if (isZoomed) {
                touchPanRef.current = null;
                return;
            }

            if (!touchStartRef.current) return;
            const touch = e.changedTouches[0];
            if (!touch) return;
            const deltaX = touch.clientX - touchStartRef.current.x;
            const deltaY = touch.clientY - touchStartRef.current.y;
            touchStartRef.current = null;
            handleSwipeGesture(deltaX, deltaY);
        },
        [isZoomed, handleSwipeGesture],
    );

    // Mouse handling: drag-to-pan when zoomed, horizontal swipe-flip when at zoom 1
    const handleMouseDown = useCallback(
        (e: React.MouseEvent) => {
            if (e.button !== 0) return;

            if (isZoomed) {
                const viewer = viewerRef.current;
                if (!viewer) return;
                e.preventDefault();
                panStartRef.current = {
                    startX: e.clientX,
                    startY: e.clientY,
                    startScrollLeft: viewer.scrollLeft,
                    startScrollTop: viewer.scrollTop,
                };
                setIsPanning(true);
                return;
            }

            mouseSwipeStartRef.current = { x: e.clientX, y: e.clientY };
            setIsSwipeDragging(true);
        },
        [isZoomed],
    );

    const handleMouseUp = useCallback(
        (e: React.MouseEvent) => {
            if (isZoomed || !mouseSwipeStartRef.current) {
                setIsSwipeDragging(false);
                return;
            }
            const deltaX = e.clientX - mouseSwipeStartRef.current.x;
            const deltaY = e.clientY - mouseSwipeStartRef.current.y;
            mouseSwipeStartRef.current = null;
            setIsSwipeDragging(false);
            handleSwipeGesture(deltaX, deltaY);
        },
        [isZoomed, handleSwipeGesture],
    );

    const handleWheel = useCallback(
        (e: React.WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const steps = e.deltaY < 0 ? 1 : -1;
                applyZoom(stepZoom(zoom, steps), { clientX: e.clientX, clientY: e.clientY });
            }
        },
        [applyZoom, zoom],
    );

    const handleDownload = useCallback(() => {
        downloadFile(getMaterialUrl(material, lang));
    }, [material, lang]);

    // Keyboard shortcuts + modal Tab focus trap
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isA11yPanelOpen) return;
            if (e.key === 'Tab') {
                const modal = modalRef.current;
                if (!modal) return;
                const focusable = Array.from(
                    modal.querySelectorAll<HTMLElement>(
                        'button:not(:disabled):not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])',
                    ),
                ).filter((el) => {
                    const style = window.getComputedStyle(el);
                    return (
                        style.display !== 'none' &&
                        style.visibility !== 'hidden' &&
                        !el.closest('[hidden], [aria-hidden="true"]')
                    );
                });

                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                const active = document.activeElement;
                const isInsideOrModal =
                    active === modal || !modal.contains(active);

                if (e.shiftKey) {
                    if (active === first || isInsideOrModal) {
                        e.preventDefault();
                        last.focus();
                    }
                } else if (active === last || isInsideOrModal) {
                    e.preventDefault();
                    first.focus();
                }
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToNext();
            } else if (e.key === 'Home') {
                e.preventDefault();
                goToFirst();
            } else if (e.key === 'End') {
                e.preventDefault();
                goToLast();
            } else if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                zoomIn();
            } else if (e.key === '-') {
                e.preventDefault();
                zoomOut();
            } else if (e.key === '0') {
                e.preventDefault();
                resetZoom();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose?.();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isA11yPanelOpen, goToPrev, goToNext, goToFirst, goToLast, zoomIn, zoomOut, resetZoom, onClose]);

    // Load visible pages for current state
    useEffect(() => {
        let cancelled = false;

        const state = getSpreadState(currentPage, totalPages, isSpread);
        const pagesToLoad = !isSpread
            ? [currentPage]
            : [state.leftPage, state.rightPage].filter((p): p is number => p !== null);

        const load = async () => {
            setError(null);
            try {
                const loaded = await Promise.all(
                    pagesToLoad.map(async (p) => ({ page: p, url: await fetchPage(p) })),
                );
                if (!cancelled) storePageUrls(loaded);
            } catch (err) {
                if (!cancelled) {
                    setError(t('flipbook.error.fetchFailed', 'Cannot fetch pdf document.'));
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
    }, [currentPage, isSpread, totalPages, fetchPage, storePageUrls, t]);

    const handlePageLoad = useCallback(
        ({ originalWidth, originalHeight }: { originalWidth: number; originalHeight: number }) => {
            if (!originalWidth || !originalHeight) return;
            const aspect = originalHeight / originalWidth;
            setPageAspect((prev) => (Math.abs(prev - aspect) < 0.001 ? prev : aspect));
        },
        [],
    );

    // ---- Layout: fit spread pages into viewer while keeping single covers proportional ----
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

    // Prefetch neighbouring pages and offscreen previews in the background
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

    const renderPdfPage = (page: number, enableTextLayer: boolean): ReactNode => {
        const url = pageUrls[page];
        return (
            <PageRenderer
                key={page}
                pageNumber={page}
                url={url}
                width={basePageWidth}
                scale={zoom}
                previewUrl={pagePreviews[page]}
                renderTextLayer={enableTextLayer}
                onLoadSuccess={handlePageLoad}
                onRenderSuccess={handlePageRenderSuccess}
                onRegisterContainer={handleRegisterContainer}
            />
        );
    };

    const spreadState = getSpreadState(currentPage, totalPages, isSpread);
    const activeFlip = flip && !reducedMotion ? flip : null;

    let baseLeft: SlotContent = 'empty';
    let baseRight: SlotContent = 'empty';
    let leafFront: SlotContent = 'empty';
    let leafBack: SlotContent = 'empty';
    let spreadTransitionClass = '';
    let showFlippingSpine = false;

    if (isSpread && activeFlip) {
        const fromState = getSpreadState(activeFlip.fromPage, totalPages, true);
        const toState = getSpreadState(activeFlip.toPage, totalPages, true);

        if (activeFlip.direction === 'next') {
            baseLeft = fromState.leftPage ?? 'empty';
            baseRight = toState.rightPage ?? 'empty';
            leafFront = fromState.rightPage ?? 'empty';
            leafBack = toState.leftPage ?? 'empty';
        } else {
            baseLeft = toState.leftPage ?? 'empty';
            baseRight = fromState.rightPage ?? 'empty';
            leafFront = fromState.leftPage ?? 'empty';
            leafBack = toState.rightPage ?? 'empty';
        }

        if (fromState.presentation === 'closed-front' && toState.presentation === 'open-spread') {
            spreadTransitionClass = styles.spreadOpeningFromFront;
        } else if (
            fromState.presentation === 'open-spread' &&
            toState.presentation === 'closed-front'
        ) {
            spreadTransitionClass = styles.spreadClosingToFront;
        } else if (
            fromState.presentation === 'open-spread' &&
            toState.presentation === 'closed-back'
        ) {
            spreadTransitionClass = styles.spreadClosingToBack;
        } else if (
            fromState.presentation === 'closed-back' &&
            toState.presentation === 'open-spread'
        ) {
            spreadTransitionClass = styles.spreadOpeningFromBack;
        } else if (
            fromState.presentation === 'closed-front' &&
            toState.presentation === 'closed-back'
        ) {
            spreadTransitionClass = styles.spreadFrontToBack;
        } else if (
            fromState.presentation === 'closed-back' &&
            toState.presentation === 'closed-front'
        ) {
            spreadTransitionClass = styles.spreadBackToFront;
        }

        showFlippingSpine =
            fromState.presentation === 'open-spread' || toState.presentation === 'open-spread';
    } else if (isSpread) {
        baseLeft = spreadState.leftPage ?? 'empty';
        baseRight = spreadState.rightPage ?? 'empty';
    }

    // Single-page mode (< 1024px)
    const singleBasePage =
        activeFlip && activeFlip.direction === 'prev' ? activeFlip.fromPage : currentPage;
    if (!isSpread && activeFlip) {
        leafFront = activeFlip.direction === 'next' ? activeFlip.fromPage : activeFlip.toPage;
        leafBack = 'empty';
    }

    const renderLeafFace = (content: SlotContent): ReactNode =>
        typeof content === 'number' ? renderPdfPage(content, false) : null;

    const leafClassName = [
        styles.flippingLeaf,
        isSpread ? styles.leafSpread : styles.leafSingle,
        activeFlip?.direction === 'prev' ? styles.leafPrev : styles.leafNext,
    ].join(' ');

    const bookStyle = { '--flip-duration': `${FLIP_DURATION_MS}ms` } as CSSProperties;
    const zoomPercent = `${Math.round(zoom * 100)}%`;

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
                aria-label={t('flipbook.dialogLabel', 'Document preview')}
                tabIndex={-1}
            >
                <div className={styles.toolbarWrapper}>
                    <div className={styles.toolbar} role="toolbar" aria-label={t('flipbook.toolbarLabel', 'Document controls')}>
                        <div className={styles.toolbarGroup}>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={zoomOut}
                                disabled={zoom <= ZOOM_MIN}
                                aria-label={t('flipbook.zoomOut', 'Zoom out')}
                                data-testid="flipbook-zoom-out"
                            >
                                <img src={BtnZoomOut} alt="" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className={styles.zoomResetBtn}
                                onClick={resetZoom}
                                disabled={zoom === DEFAULT_ZOOM}
                                aria-label={t('flipbook.zoomReset', 'Reset zoom to 100%')}
                                data-testid="flipbook-zoom-reset"
                            >
                                {zoomPercent}
                            </button>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={zoomIn}
                                disabled={zoom >= ZOOM_MAX}
                                aria-label={t('flipbook.zoomIn', 'Zoom in')}
                                data-testid="flipbook-zoom-in"
                            >
                                <img src={BtnZoomIn} alt="" aria-hidden="true" />
                            </button>
                        </div>

                        <div className={styles.toolbarDivider} aria-hidden="true" />

                        <div className={styles.toolbarGroup}>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={goToPrev}
                                disabled={isPrevDisabled(currentPage)}
                                aria-label={t('flipbook.prevPage', 'Previous page')}
                                data-testid="flipbook-prev-page"
                            >
                                <img src={BtnPrev} alt="" aria-hidden="true" />
                            </button>
                            <span
                                className={styles.pageIndicator}
                                data-testid="flipbook-page-indicator"
                                aria-live="polite"
                            >
                                {formatPageIndicator(currentPage, totalPages, isSpread)}
                            </span>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={goToNext}
                                disabled={isNextDisabled(currentPage, totalPages, isSpread)}
                                aria-label={t('flipbook.nextPage', 'Next page')}
                                data-testid="flipbook-next-page"
                            >
                                <img src={BtnNext} alt="" aria-hidden="true" />
                            </button>
                        </div>

                        <div className={styles.toolbarDivider} aria-hidden="true" />

                        <div className={styles.toolbarGroup}>
                            <AccessibilityTrigger variant="toolbar" />
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={handleDownload}
                                aria-label={t('flipbook.download', 'Download PDF')}
                                data-testid="flipbook-download"
                            >
                                <img src={BtnDownload} alt="" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={onClose}
                                aria-label={t('flipbook.close', 'Close')}
                                data-testid="flipbook-close"
                            >
                                <img src={BtnClose} alt="" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={`${styles.viewer} ${isZoomed ? styles.viewerZoomed : ''}`}
                    data-testid="flipbook-viewer"
                    ref={viewerRef}
                    onWheel={handleWheel}
                >
                    {error ? (
                        <div className={styles.status} data-testid="flipbook-error">
                            {error}
                        </div>
                    ) : (
                        <div
                            ref={bookRef}
                            className={styles.book}
                            style={bookStyle}
                            data-testid="flipbook-book"
                            data-mode={isSpread ? 'spread' : 'single'}
                            data-presentation={spreadState.presentation}
                            data-reduced-motion={reducedMotion ? 'true' : 'false'}
                            data-zoomed={isZoomed ? 'true' : 'false'}
                            data-zoom={String(zoom)}
                            data-panning={isPanning ? 'true' : 'false'}
                            data-dragging={isSwipeDragging ? 'true' : 'false'}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
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
                                aria-label={t('flipbook.prevPage', 'Previous page')}
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
                                aria-label={t('flipbook.nextPage', 'Next page')}
                                tabIndex={-1}
                            />

                            {isSpread && !activeFlip && spreadState.presentation === 'closed-front' ? (
                                <div className={styles.singleSheetSpread}>
                                    <div
                                        className={styles.coverSheet}
                                        style={sheetStyle}
                                        data-testid="flipbook-cover-sheet"
                                        data-page-number="1"
                                    >
                                        {renderPdfPage(1, true)}
                                    </div>
                                </div>
                            ) : isSpread &&
                              !activeFlip &&
                              spreadState.presentation === 'closed-back' &&
                              spreadState.leftPage !== null ? (
                                <div className={styles.singleSheetSpread}>
                                    <div
                                        className={styles.backCoverSheet}
                                        style={sheetStyle}
                                        data-testid="flipbook-back-sheet"
                                        data-page-number={String(spreadState.leftPage)}
                                    >
                                        {renderPdfPage(spreadState.leftPage, true)}
                                    </div>
                                </div>
                            ) : isSpread ? (
                                <div
                                    className={`${styles.spreadContainer} ${spreadTransitionClass}`.trim()}
                                >
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
                                            {renderPdfPage(baseLeft, true)}
                                        </div>
                                    )}

                                    {baseRight === 'empty' ? (
                                        <div
                                            className={styles.emptyHalf}
                                            style={sheetStyle}
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <div
                                            className={styles.pageSheetRight}
                                            style={sheetStyle}
                                            data-testid="flipbook-right-page"
                                            data-page-number={String(baseRight)}
                                        >
                                            {renderPdfPage(baseRight, true)}
                                        </div>
                                    )}

                                    {(!activeFlip || showFlippingSpine) && (
                                        <div
                                            className={styles.bookSpine}
                                            data-testid="flipbook-spine"
                                            aria-hidden="true"
                                        />
                                    )}

                                    {activeFlip &&
                                        ((activeFlip.direction === 'next' &&
                                            baseRight !== 'empty') ||
                                            (activeFlip.direction === 'prev' &&
                                                baseLeft !== 'empty')) && (
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
                                        {renderPdfPage(singleBasePage, true)}
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
