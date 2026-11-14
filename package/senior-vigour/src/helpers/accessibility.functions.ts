import {
    A11Y_STORAGE_KEY,
    DEFAULT_ACCESSIBILITY_PREFERENCES,
    FONT_SCALE_STEPS,
    type FontScaleStep,
    type IAccessibilityPreferences,
} from '../types/accessibility';

function isValidFontScale(value: unknown): value is FontScaleStep {
    return (
        typeof value === 'number' &&
        (FONT_SCALE_STEPS as readonly number[]).includes(value)
    );
}

export function sanitizeAccessibilityPreferences(
    raw: unknown,
): IAccessibilityPreferences {
    if (!raw || typeof raw !== 'object') {
        return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    }
    const candidate = raw as Record<string, unknown>;
    return {
        fontScale: isValidFontScale(candidate.fontScale)
            ? candidate.fontScale
            : DEFAULT_ACCESSIBILITY_PREFERENCES.fontScale,
        fontMode:
            candidate.fontMode === 'readable' ? 'readable' : 'default',
        highContrast: candidate.highContrast === true,
        wideSpacing: candidate.wideSpacing === true,
        largeTargets: candidate.largeTargets === true,
        underlineLinks: candidate.underlineLinks === true,
        reducedMotion: candidate.reducedMotion === true,
    };
}

export function readStoredAccessibilityPreferences(): IAccessibilityPreferences {
    if (typeof window === 'undefined') {
        return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    }
    try {
        const stored = window.localStorage.getItem(A11Y_STORAGE_KEY);
        if (!stored) {
            return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
        }
        return sanitizeAccessibilityPreferences(JSON.parse(stored));
    } catch {
        return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    }
}

export function areAccessibilityPreferencesDefault(
    prefs: IAccessibilityPreferences,
): boolean {
    return (
        prefs.fontScale === DEFAULT_ACCESSIBILITY_PREFERENCES.fontScale &&
        prefs.fontMode === DEFAULT_ACCESSIBILITY_PREFERENCES.fontMode &&
        prefs.highContrast === DEFAULT_ACCESSIBILITY_PREFERENCES.highContrast &&
        prefs.wideSpacing === DEFAULT_ACCESSIBILITY_PREFERENCES.wideSpacing &&
        prefs.largeTargets === DEFAULT_ACCESSIBILITY_PREFERENCES.largeTargets &&
        prefs.underlineLinks ===
            DEFAULT_ACCESSIBILITY_PREFERENCES.underlineLinks &&
        prefs.reducedMotion === DEFAULT_ACCESSIBILITY_PREFERENCES.reducedMotion
    );
}

export function writeStoredAccessibilityPreferences(
    prefs: IAccessibilityPreferences,
): void {
    if (typeof window === 'undefined') return;
    try {
        if (areAccessibilityPreferencesDefault(prefs)) {
            window.localStorage.removeItem(A11Y_STORAGE_KEY);
        } else {
            window.localStorage.setItem(A11Y_STORAGE_KEY, JSON.stringify(prefs));
        }
    } catch {
        // Ignore storage errors (e.g., private browsing quota)
    }
}

export function applyAccessibilityPreferencesToDom(
    prefs: IAccessibilityPreferences,
): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    root.style.setProperty('--sv-font-scale', String(prefs.fontScale));

    const toggleAttr = (attr: string, active: boolean, value: string) => {
        if (active) {
            root.setAttribute(attr, value);
        } else {
            root.removeAttribute(attr);
        }
    };

    toggleAttr('data-a11y-font', prefs.fontMode === 'readable', 'readable');
    toggleAttr('data-a11y-contrast', prefs.highContrast, 'high');
    toggleAttr('data-a11y-spacing', prefs.wideSpacing, 'wide');
    toggleAttr('data-a11y-targets', prefs.largeTargets, 'large');
    toggleAttr('data-a11y-links', prefs.underlineLinks, 'underline');
    toggleAttr('data-a11y-motion', prefs.reducedMotion, 'reduce');
}
