import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook providing mouse drag-to-scroll and auto-scroll into view for horizontal scrollable containers.
 * Native touch scrolling is supported out-of-the-box by the CSS container.
 */
export const useSwipeScroll = <T extends HTMLElement = HTMLDivElement>(activeKey?: string) => {
    const scrollRef = useRef<T>(null);
    const isDownRef = useRef(false);
    const startXRef = useRef(0);
    const scrollLeftRef = useRef(0);
    const isDraggingRef = useRef(false);

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        isDownRef.current = true;
        startXRef.current = e.pageX - scrollRef.current.offsetLeft;
        scrollLeftRef.current = scrollRef.current.scrollLeft;
        isDraggingRef.current = false;
    }, []);

    const onMouseLeave = useCallback(() => {
        isDownRef.current = false;
    }, []);

    const onMouseUp = useCallback(() => {
        isDownRef.current = false;
        // Keep isDragging flag briefly so click event is swallowed
        setTimeout(() => {
            isDraggingRef.current = false;
        }, 50);
    }, []);

    const onMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDownRef.current || !scrollRef.current) return;
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startXRef.current) * 1.2;
        if (Math.abs(walk) > 6) {
            isDraggingRef.current = true;
            scrollRef.current.scrollLeft = scrollLeftRef.current - walk;
        }
    }, []);

    const onClickCapture = useCallback((e: React.MouseEvent) => {
        if (isDraggingRef.current) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, []);

    // Auto-scroll active item into view when key changes
    useEffect(() => {
        if (!scrollRef.current) return;
        const activeEl = scrollRef.current.querySelector<HTMLElement>('[aria-selected="true"]');
        if (activeEl && typeof activeEl.scrollIntoView === 'function') {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeKey]);

    return {
        scrollRef,
        onMouseDown,
        onMouseLeave,
        onMouseUp,
        onMouseMove,
        onClickCapture,
    };
};
