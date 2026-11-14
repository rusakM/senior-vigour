export type FontScaleStep = 1 | 1.25 | 1.5 | 1.75 | 2;
export type FontFamilyMode = 'default' | 'readable';

export const FONT_SCALE_STEPS: readonly FontScaleStep[] = [1, 1.25, 1.5, 1.75, 2] as const;
export const FONT_SCALE_MIN: FontScaleStep = 1;
export const FONT_SCALE_MAX: FontScaleStep = 2;

export interface IAccessibilityPreferences {
    fontScale: FontScaleStep;
    fontMode: FontFamilyMode;
    highContrast: boolean;
    wideSpacing: boolean;
    largeTargets: boolean;
    underlineLinks: boolean;
    reducedMotion: boolean;
}

export interface IAccessibilityContextValue {
    preferences: IAccessibilityPreferences;
    isPanelOpen: boolean;
    openPanel: (triggerEl?: HTMLElement | null) => void;
    closePanel: () => void;
    togglePanel: (triggerEl?: HTMLElement | null) => void;
    increaseFontScale: () => void;
    decreaseFontScale: () => void;
    setFontScale: (scale: FontScaleStep) => void;
    setFontMode: (mode: FontFamilyMode) => void;
    toggleHighContrast: () => void;
    toggleWideSpacing: () => void;
    toggleLargeTargets: () => void;
    toggleUnderlineLinks: () => void;
    toggleReducedMotion: () => void;
    resetPreferences: () => void;
}

export const A11Y_STORAGE_KEY = 'sv_a11y_preferences';

export const DEFAULT_ACCESSIBILITY_PREFERENCES: IAccessibilityPreferences = {
    fontScale: 1,
    fontMode: 'default',
    highContrast: false,
    wideSpacing: false,
    largeTargets: false,
    underlineLinks: false,
    reducedMotion: false,
};
