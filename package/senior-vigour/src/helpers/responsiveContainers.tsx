/* eslint-disable react-refresh/only-export-components */
import type { ReactElement } from "react";
import { useMediaQuery } from "react-responsive";

interface ChildrenProps {
    children: ReactElement;
}

export const BREAKPOINT = {
    MOBILE_SMALL: 550,
    MOBILE: 767,
    TABLET_START: 768,
    TABLET_END: 1023,
    DESKTOP_START: 1024,
} as const;

export function isIOS(): boolean {
    return /iPhone|iPod|iPad/.test(navigator.userAgent);
}

export function useMobile(): boolean {
    return useMediaQuery({ maxWidth: BREAKPOINT.MOBILE });
}

export function useTablet(): boolean {
    return useMediaQuery({
        minWidth: BREAKPOINT.TABLET_START,
        maxWidth: BREAKPOINT.TABLET_END,
    });
}

export function useDesktop(): boolean {
    return useMediaQuery({ minWidth: BREAKPOINT.DESKTOP_START });
}

export function useNotMobile(): boolean {
    return useMediaQuery({ minWidth: BREAKPOINT.TABLET_START });
}

export function useMobileSmall(): boolean {
    return useMediaQuery({ maxWidth: BREAKPOINT.MOBILE_SMALL });
}

export function useDeviceType() {
    const isDesktop = useDesktop();
    const isTablet = useTablet();
    const isMobile = useMobile();
    const isNotMobile = useNotMobile();
    const isMobileSmall = useMobileSmall();

    return {
        isDesktop,
        isTablet,
        isMobile,
        isNotMobile,
        isMobileSmall,
    };
}

export function MobileView({ children }: ChildrenProps): ReactElement {
    const isMobile = useMobile();
    return isMobile ? children : <></>;
}

export function TabletView({ children }: ChildrenProps): ReactElement {
    const isTablet = useTablet();
    return isTablet ? children : <></>;
}

export function DesktopView({ children }: ChildrenProps): ReactElement {
    const isDesktop = useDesktop();
    return isDesktop ? children : <></>;
}

export function NotMobileView({ children }: ChildrenProps): ReactElement {
    const isNotMobile = useNotMobile();
    return isNotMobile ? children : <></>;
}
