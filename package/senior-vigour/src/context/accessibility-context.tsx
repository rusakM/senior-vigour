import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FC,
    type ReactNode,
} from 'react';
import {
    DEFAULT_ACCESSIBILITY_PREFERENCES,
    FONT_SCALE_STEPS,
    type FontFamilyMode,
    type FontScaleStep,
    type IAccessibilityContextValue,
    type IAccessibilityPreferences,
} from '../types/accessibility';
import {
    applyAccessibilityPreferencesToDom,
    readStoredAccessibilityPreferences,
    writeStoredAccessibilityPreferences,
} from '../helpers/accessibility.functions';

const NOOP = () => {};

const FALLBACK_CONTEXT_VALUE: IAccessibilityContextValue = {
    preferences: DEFAULT_ACCESSIBILITY_PREFERENCES,
    isPanelOpen: false,
    openPanel: NOOP,
    closePanel: NOOP,
    togglePanel: NOOP,
    increaseFontScale: NOOP,
    decreaseFontScale: NOOP,
    setFontScale: NOOP,
    setFontMode: NOOP,
    toggleHighContrast: NOOP,
    toggleWideSpacing: NOOP,
    toggleLargeTargets: NOOP,
    toggleUnderlineLinks: NOOP,
    toggleReducedMotion: NOOP,
    resetPreferences: NOOP,
};

const AccessibilityContext =
    createContext<IAccessibilityContextValue>(FALLBACK_CONTEXT_VALUE);

export interface AccessibilityProviderProps {
    children: ReactNode;
}

export const AccessibilityProvider: FC<AccessibilityProviderProps> = ({
    children,
}) => {
    const [preferences, setPreferences] = useState<IAccessibilityPreferences>(
        readStoredAccessibilityPreferences,
    );
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const openerRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        applyAccessibilityPreferencesToDom(preferences);
    }, [preferences]);

    const updatePreferences = useCallback(
        (
            updater: (
                prev: IAccessibilityPreferences,
            ) => IAccessibilityPreferences,
        ) => {
            setPreferences((prev) => {
                const next = updater(prev);
                writeStoredAccessibilityPreferences(next);
                return next;
            });
        },
        [],
    );

    const openPanel = useCallback((triggerEl?: HTMLElement | null) => {
        openerRef.current =
            triggerEl ??
            (document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null);
        setIsPanelOpen(true);
    }, []);

    const closePanel = useCallback(() => {
        setIsPanelOpen(false);
        const opener = openerRef.current;
        openerRef.current = null;
        if (opener && opener.isConnected) {
            requestAnimationFrame(() => opener.focus());
        }
    }, []);

    const togglePanel = useCallback(
        (triggerEl?: HTMLElement | null) => {
            setIsPanelOpen((prev) => {
                if (prev) {
                    const opener = openerRef.current;
                    openerRef.current = null;
                    if (opener && opener.isConnected) {
                        requestAnimationFrame(() => opener.focus());
                    }
                    return false;
                }
                openerRef.current =
                    triggerEl ??
                    (document.activeElement instanceof HTMLElement
                        ? document.activeElement
                        : null);
                return true;
            });
        },
        [],
    );

    const increaseFontScale = useCallback(() => {
        updatePreferences((prev) => {
            const idx = FONT_SCALE_STEPS.indexOf(prev.fontScale);
            const nextScale =
                idx >= 0 && idx < FONT_SCALE_STEPS.length - 1
                    ? FONT_SCALE_STEPS[idx + 1]
                    : FONT_SCALE_STEPS[FONT_SCALE_STEPS.length - 1];
            return { ...prev, fontScale: nextScale };
        });
    }, [updatePreferences]);

    const decreaseFontScale = useCallback(() => {
        updatePreferences((prev) => {
            const idx = FONT_SCALE_STEPS.indexOf(prev.fontScale);
            const nextScale =
                idx > 0 ? FONT_SCALE_STEPS[idx - 1] : FONT_SCALE_STEPS[0];
            return { ...prev, fontScale: nextScale };
        });
    }, [updatePreferences]);

    const setFontScale = useCallback(
        (scale: FontScaleStep) => {
            updatePreferences((prev) => ({ ...prev, fontScale: scale }));
        },
        [updatePreferences],
    );

    const setFontMode = useCallback(
        (mode: FontFamilyMode) => {
            updatePreferences((prev) => ({ ...prev, fontMode: mode }));
        },
        [updatePreferences],
    );

    const toggleHighContrast = useCallback(() => {
        updatePreferences((prev) => ({
            ...prev,
            highContrast: !prev.highContrast,
        }));
    }, [updatePreferences]);

    const toggleWideSpacing = useCallback(() => {
        updatePreferences((prev) => ({
            ...prev,
            wideSpacing: !prev.wideSpacing,
        }));
    }, [updatePreferences]);

    const toggleLargeTargets = useCallback(() => {
        updatePreferences((prev) => ({
            ...prev,
            largeTargets: !prev.largeTargets,
        }));
    }, [updatePreferences]);

    const toggleUnderlineLinks = useCallback(() => {
        updatePreferences((prev) => ({
            ...prev,
            underlineLinks: !prev.underlineLinks,
        }));
    }, [updatePreferences]);

    const toggleReducedMotion = useCallback(() => {
        updatePreferences((prev) => ({
            ...prev,
            reducedMotion: !prev.reducedMotion,
        }));
    }, [updatePreferences]);

    const resetPreferences = useCallback(() => {
        updatePreferences(() => ({ ...DEFAULT_ACCESSIBILITY_PREFERENCES }));
    }, [updatePreferences]);

    const value = useMemo<IAccessibilityContextValue>(
        () => ({
            preferences,
            isPanelOpen,
            openPanel,
            closePanel,
            togglePanel,
            increaseFontScale,
            decreaseFontScale,
            setFontScale,
            setFontMode,
            toggleHighContrast,
            toggleWideSpacing,
            toggleLargeTargets,
            toggleUnderlineLinks,
            toggleReducedMotion,
            resetPreferences,
        }),
        [
            preferences,
            isPanelOpen,
            openPanel,
            closePanel,
            togglePanel,
            increaseFontScale,
            decreaseFontScale,
            setFontScale,
            setFontMode,
            toggleHighContrast,
            toggleWideSpacing,
            toggleLargeTargets,
            toggleUnderlineLinks,
            toggleReducedMotion,
            resetPreferences,
        ],
    );

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAccessibility = (): IAccessibilityContextValue =>
    useContext(AccessibilityContext);
