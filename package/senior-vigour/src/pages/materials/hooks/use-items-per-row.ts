import { useState, useEffect } from 'react';
import { BREAKPOINT, useMobile } from '../../../helpers/responsiveContainers';

/**
 * Returns the number of visible items per row based on viewport width:
 * - Mobile (< 768px): 1 item
 * - Tablet / small screens (768px - 1023px): 3 items
 * - Laptop (1024px - 1439px): 4 items
 * - Desktop / FullHD (>= 1440px): 5 items
 */
export const useItemsPerRow = (): number => {
    const isMobile = useMobile();

    const getItemsCount = (): number => {
        if (typeof window === 'undefined') return 5;

        const width = window.innerWidth;

        if (width < BREAKPOINT.TABLET_START) return 1;
        if (width < BREAKPOINT.DESKTOP_START) return 3;
        if (width < 1440) return 4;

        return 5;
    };

    const [itemsPerRow, setItemsPerRow] = useState<number>(() =>
        getItemsCount()
    );

    useEffect(() => {
        const handleResize = () => {
            setItemsPerRow(getItemsCount());
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isMobile ? 1 : itemsPerRow;
};