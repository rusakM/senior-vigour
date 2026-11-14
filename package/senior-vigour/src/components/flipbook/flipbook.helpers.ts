export const SPREAD_BREAKPOINT = 1024;
export const FLIP_DURATION_MS = 600;
export const ZOOM_MIN = 1.0;
export const ZOOM_MAX = 3.0;
export const ZOOM_STEP = 0.25;
export const DEFAULT_ZOOM = 1.0;

export type BookPresentationState = 'closed-front' | 'open-spread' | 'closed-back';

export const isSpreadViewport = (width: number): boolean => width >= SPREAD_BREAKPOINT;

export const clampNumber = (value: number, min: number, max: number): number =>
    Math.min(Math.max(value, min), max);

export const normalizePageForMode = (
    page: number,
    totalPages: number,
    isSpread: boolean,
): number => {
    const maxPages = Math.max(1, totalPages);
    const clamped = clampNumber(page, 1, maxPages);

    if (!isSpread || clamped <= 1) {
        return clamped;
    }

    // In spread mode, pages > 1 start with an even page on the left
    return clamped % 2 === 0 ? clamped : clamped - 1;
};

export const getLastPage = (totalPages: number, isSpread: boolean): number => {
    if (totalPages <= 1) return 1;
    return normalizePageForMode(totalPages, totalPages, isSpread);
};

export interface SpreadState {
    presentation: BookPresentationState;
    isCover: boolean;
    isBackCover: boolean;
    leftPage: number | null;
    rightPage: number | null;
    isSingleSheetVisible: boolean;
}

export const getSpreadState = (
    currentPage: number,
    totalPages: number,
    isSpread: boolean,
): SpreadState => {
    if (!isSpread) {
        const isCover = currentPage <= 1;
        const isBackCover = totalPages > 1 && currentPage >= totalPages;
        return {
            presentation: isCover ? 'closed-front' : isBackCover ? 'closed-back' : 'open-spread',
            isCover,
            isBackCover,
            leftPage: null,
            rightPage: currentPage,
            isSingleSheetVisible: true,
        };
    }

    if (totalPages <= 1 || currentPage <= 1) {
        return {
            presentation: 'closed-front',
            isCover: true,
            isBackCover: totalPages === 1,
            leftPage: null,
            rightPage: 1,
            isSingleSheetVisible: true,
        };
    }

    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const hasRight = leftPage + 1 <= totalPages;

    if (!hasRight) {
        return {
            presentation: 'closed-back',
            isCover: false,
            isBackCover: true,
            leftPage,
            rightPage: null,
            isSingleSheetVisible: true,
        };
    }

    return {
        presentation: 'open-spread',
        isCover: false,
        isBackCover: false,
        leftPage,
        rightPage: leftPage + 1,
        isSingleSheetVisible: false,
    };
};

export const formatPageIndicator = (
    currentPage: number,
    totalPages: number,
    isSpread: boolean,
): string => {
    if (!totalPages || totalPages <= 0) {
        return `${currentPage}/—`;
    }

    if (!isSpread || totalPages === 1 || currentPage <= 1) {
        return `${currentPage}/${totalPages}`;
    }

    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    if (leftPage + 1 <= totalPages) {
        return `${leftPage}\u2013${leftPage + 1}/${totalPages}`;
    }

    return `${leftPage}/${totalPages}`;
};

export const getNextPage = (
    currentPage: number,
    totalPages: number,
    isSpread: boolean,
): number => {
    if (!isSpread) {
        return Math.min(totalPages, currentPage + 1);
    }

    if (currentPage <= 1) {
        return Math.min(totalPages, 2);
    }

    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    if (leftPage + 2 <= totalPages) {
        return leftPage + 2;
    }

    return leftPage;
};

export const getPrevPage = (currentPage: number, isSpread: boolean): number => {
    if (!isSpread) {
        return Math.max(1, currentPage - 1);
    }

    if (currentPage <= 1) {
        return 1;
    }

    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    if (leftPage <= 2) {
        return 1;
    }

    return Math.max(1, leftPage - 2);
};

export const isNextDisabled = (
    currentPage: number,
    totalPages: number,
    isSpread: boolean,
): boolean => {
    if (totalPages <= 1) {
        return true;
    }

    if (!isSpread) {
        return currentPage >= totalPages;
    }

    if (currentPage <= 1) {
        return totalPages <= 1;
    }

    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    return leftPage + 2 > totalPages;
};

export const isPrevDisabled = (currentPage: number): boolean => currentPage <= 1;

export const clampZoom = (zoom: number): number =>
    parseFloat(clampNumber(zoom, ZOOM_MIN, ZOOM_MAX).toFixed(2));

export const stepZoom = (currentZoom: number, deltaSteps: number): number =>
    clampZoom(currentZoom + deltaSteps * ZOOM_STEP);

export interface ZoomAnchorParams {
    currentScrollLeft: number;
    currentScrollTop: number;
    prevContentWidth: number;
    prevContentHeight: number;
    nextContentWidth: number;
    nextContentHeight: number;
    anchorX: number;
    anchorY: number;
    viewportWidth: number;
    viewportHeight: number;
}

export interface ZoomAnchorResult {
    nextScrollLeft: number;
    nextScrollTop: number;
}

export const calculateZoomScrollAnchor = ({
    currentScrollLeft,
    currentScrollTop,
    prevContentWidth,
    prevContentHeight,
    nextContentWidth,
    nextContentHeight,
    anchorX,
    anchorY,
    viewportWidth,
    viewportHeight,
}: ZoomAnchorParams): ZoomAnchorResult => {
    const safePrevW = Math.max(1, prevContentWidth);
    const safePrevH = Math.max(1, prevContentHeight);
    const relX = (currentScrollLeft + anchorX) / safePrevW;
    const relY = (currentScrollTop + anchorY) / safePrevH;

    const maxLeft = Math.max(0, nextContentWidth - viewportWidth);
    const maxTop = Math.max(0, nextContentHeight - viewportHeight);

    return {
        nextScrollLeft: clampNumber(Math.round(relX * nextContentWidth - anchorX), 0, maxLeft),
        nextScrollTop: clampNumber(Math.round(relY * nextContentHeight - anchorY), 0, maxTop),
    };
};

export const clampScrollPosition = (
    scrollLeft: number,
    scrollTop: number,
    scrollWidth: number,
    scrollHeight: number,
    clientWidth: number,
    clientHeight: number,
): { scrollLeft: number; scrollTop: number } => ({
    scrollLeft: clampNumber(scrollLeft, 0, Math.max(0, scrollWidth - clientWidth)),
    scrollTop: clampNumber(scrollTop, 0, Math.max(0, scrollHeight - clientHeight)),
});
