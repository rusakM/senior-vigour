export const SPREAD_BREAKPOINT = 1024;
export const FLIP_DURATION_MS = 600;

export const isSpreadViewport = (width: number): boolean => width >= SPREAD_BREAKPOINT;

export const normalizePageForMode = (
    page: number,
    totalPages: number,
    isSpread: boolean,
): number => {
    const maxPages = Math.max(1, totalPages);
    const clamped = Math.min(Math.max(1, page), maxPages);

    if (!isSpread || clamped <= 1) {
        return clamped;
    }

    // In spread mode, pages > 1 start with an even page on the left:
    return clamped % 2 === 0 ? clamped : clamped - 1;
};

export interface SpreadState {
    isCover: boolean;
    leftPage: number | null;
    rightPage: number | null;
    isRightBlank: boolean;
}

export const getSpreadState = (
    currentPage: number,
    totalPages: number,
    isSpread: boolean,
): SpreadState => {
    if (!isSpread) {
        return {
            isCover: false,
            leftPage: null,
            rightPage: currentPage,
            isRightBlank: false,
        };
    }

    if (currentPage <= 1) {
        return {
            isCover: true,
            leftPage: null,
            rightPage: 1,
            isRightBlank: false,
        };
    }

    const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
    const hasRight = leftPage + 1 <= totalPages;
    const rightPage = hasRight ? leftPage + 1 : null;
    const isRightBlank = !hasRight;

    return {
        isCover: false,
        leftPage,
        rightPage,
        isRightBlank,
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

    if (!isSpread || currentPage <= 1) {
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

export const isPrevDisabled = (currentPage: number): boolean => {
    return currentPage <= 1;
};
