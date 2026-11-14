import { useEffect, useRef, type FC } from 'react';
import { useTranslate } from '@tolgee/react';
import { useAccessibility } from '../../context/accessibility-context';
import {
    FONT_SCALE_MAX,
    FONT_SCALE_MIN,
} from '../../types/accessibility';
import styles from './accessibility-widget.module.scss';

const AccessibilityIconSvg: FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
        <path d="M7 10.5h10" />
        <path d="M12 10.5v4.5" />
        <path d="m9.5 19 2.5-4 2.5 4" />
    </svg>
);

export type AccessibilityTriggerVariant =
    | 'header'
    | 'questionnaire'
    | 'toolbar'
    | 'floating';

export interface AccessibilityTriggerProps {
    variant?: AccessibilityTriggerVariant;
    showLabel?: boolean;
    className?: string;
}

export const AccessibilityTrigger: FC<AccessibilityTriggerProps> = ({
    variant = 'header',
    showLabel = false,
    className,
}) => {
    const { t } = useTranslate();
    const { isPanelOpen, togglePanel } = useAccessibility();

    const variantClassMap: Record<AccessibilityTriggerVariant, string> = {
        header: styles.triggerHeader,
        questionnaire: styles.triggerQuestionnaire,
        toolbar: styles.triggerToolbar,
        floating: styles.triggerFloating,
    };

    const label = t('accessibility.triggerLabel', 'Accessibility settings');

    return (
        <button
            type="button"
            className={[
                styles.triggerBtn,
                variantClassMap[variant],
                className || '',
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={(e) => togglePanel(e.currentTarget)}
            aria-expanded={isPanelOpen}
            aria-controls="sv-accessibility-panel"
            aria-haspopup="dialog"
            aria-label={label}
            title={label}
            data-testid="a11y-trigger"
        >
            <AccessibilityIconSvg className={styles.triggerIcon} />
            {showLabel && (
                <span className={styles.triggerLabel}>
                    {t('accessibility.shortLabel', 'Accessibility')}
                </span>
            )}
        </button>
    );
};

interface SwitchItem {
    id: string;
    testId: string;
    label: string;
    description: string;
    checked: boolean;
    onToggle: () => void;
}

const AccessibilityWidget: FC = () => {
    const { t } = useTranslate();
    const {
        preferences,
        isPanelOpen,
        closePanel,
        increaseFontScale,
        decreaseFontScale,
        setFontMode,
        toggleHighContrast,
        toggleWideSpacing,
        toggleLargeTargets,
        toggleUnderlineLinks,
        toggleReducedMotion,
        resetPreferences,
    } = useAccessibility();

    const panelRef = useRef<HTMLDivElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!isPanelOpen) return;

        // Move keyboard focus cleanly into the panel once mounted
        const frame = requestAnimationFrame(() => {
            if (closeButtonRef.current) {
                closeButtonRef.current.focus();
            } else {
                panelRef.current?.focus();
            }
        });

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                closePanel();
                return;
            }

            if (e.key === 'Tab') {
                const panel = panelRef.current;
                if (!panel) return;
                const focusable = Array.from(
                    panel.querySelectorAll<HTMLElement>(
                        'button:not(:disabled):not([tabindex="-1"]), [href], [tabindex]:not([tabindex="-1"])',
                    ),
                ).filter((el) => {
                    const style = window.getComputedStyle(el);
                    return (
                        style.display !== 'none' &&
                        style.visibility !== 'hidden'
                    );
                });

                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                const active = document.activeElement;
                const isRootOrOutside =
                    active === panel || !panel.contains(active);

                if (e.shiftKey) {
                    if (active === first || isRootOrOutside) {
                        e.preventDefault();
                        last.focus();
                    }
                } else if (active === last || isRootOrOutside) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [isPanelOpen, closePanel]);

    if (!isPanelOpen) {
        return null;
    }

    const scalePercent = `${Math.round(preferences.fontScale * 100)}%`;

    const switches: SwitchItem[] = [
        {
            id: 'contrast',
            testId: 'a11y-toggle-contrast',
            label: t('accessibility.highContrast.label', 'High contrast'),
            description: t(
                'accessibility.highContrast.desc',
                'Stronger text, border and button contrast',
            ),
            checked: preferences.highContrast,
            onToggle: toggleHighContrast,
        },
        {
            id: 'spacing',
            testId: 'a11y-toggle-spacing',
            label: t('accessibility.wideSpacing.label', 'Increased spacing'),
            description: t(
                'accessibility.wideSpacing.desc',
                'Wider line, word and letter spacing',
            ),
            checked: preferences.wideSpacing,
            onToggle: toggleWideSpacing,
        },
        {
            id: 'targets',
            testId: 'a11y-toggle-targets',
            label: t('accessibility.largeTargets.label', 'Larger buttons'),
            description: t(
                'accessibility.largeTargets.desc',
                'Bigger interactive buttons and inputs',
            ),
            checked: preferences.largeTargets,
            onToggle: toggleLargeTargets,
        },
        {
            id: 'links',
            testId: 'a11y-toggle-links',
            label: t('accessibility.underlineLinks.label', 'Underline links'),
            description: t(
                'accessibility.underlineLinks.desc',
                'Clearly underlines text links across pages',
            ),
            checked: preferences.underlineLinks,
            onToggle: toggleUnderlineLinks,
        },
        {
            id: 'motion',
            testId: 'a11y-toggle-motion',
            label: t('accessibility.reducedMotion.label', 'Reduce animations'),
            description: t(
                'accessibility.reducedMotion.desc',
                'Minimizes page transitions and 3D flips',
            ),
            checked: preferences.reducedMotion,
            onToggle: toggleReducedMotion,
        },
    ];

    return (
        <div
            className={styles.panelBackdrop}
            data-testid="a11y-backdrop"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    closePanel();
                }
            }}
        >
            <div
                ref={panelRef}
                id="sv-accessibility-panel"
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="sv-a11y-panel-title"
                tabIndex={-1}
                data-testid="a11y-panel"
            >
                <div className={styles.panelHeader}>
                    <div className={styles.panelTitleGroup}>
                        <AccessibilityIconSvg
                            className={styles.panelTitleIcon}
                        />
                        <h2
                            id="sv-a11y-panel-title"
                            className={styles.panelTitle}
                        >
                            {t('accessibility.panelTitle', 'Accessibility')}
                        </h2>
                    </div>

                    <button
                        ref={closeButtonRef}
                        type="button"
                        className={styles.closeBtn}
                        onClick={closePanel}
                        aria-label={t(
                            'accessibility.close',
                            'Close accessibility settings',
                        )}
                        data-testid="a11y-panel-close"
                    >
                        <span aria-hidden="true">✕</span>
                    </button>
                </div>

                {/* A — Font Size */}
                <div className={styles.section}>
                    <span className={styles.sectionLabel}>
                        {t('accessibility.fontScale.label', 'Text size')}
                    </span>
                    <div className={styles.scaleRow}>
                        <button
                            type="button"
                            className={styles.scaleStepBtn}
                            onClick={decreaseFontScale}
                            disabled={preferences.fontScale <= FONT_SCALE_MIN}
                            aria-label={t(
                                'accessibility.fontScale.decrease',
                                'Decrease text size',
                            )}
                            data-testid="a11y-font-decrease"
                        >
                            A−
                        </button>
                        <span
                            className={styles.scaleReadout}
                            aria-live="polite"
                            data-testid="a11y-font-scale-value"
                        >
                            {scalePercent}
                        </span>
                        <button
                            type="button"
                            className={styles.scaleStepBtn}
                            onClick={increaseFontScale}
                            disabled={preferences.fontScale >= FONT_SCALE_MAX}
                            aria-label={t(
                                'accessibility.fontScale.increase',
                                'Increase text size',
                            )}
                            data-testid="a11y-font-increase"
                        >
                            A+
                        </button>
                    </div>
                    <p className={styles.helperNote}>
                        {t(
                            'accessibility.pdfZoomNote',
                            'Interface scaling applies to app controls. Use document zoom inside PDF preview.',
                        )}
                    </p>
                </div>

                {/* B — Font Family */}
                <div className={styles.section}>
                    <span
                        id="sv-a11y-font-mode-label"
                        className={styles.sectionLabel}
                    >
                        {t('accessibility.fontMode.label', 'Font style')}
                    </span>
                    <div
                        className={styles.segmentedGroup}
                        role="group"
                        aria-labelledby="sv-a11y-font-mode-label"
                    >
                        <button
                            type="button"
                            className={styles.segmentBtn}
                            aria-pressed={preferences.fontMode === 'default'}
                            onClick={() => setFontMode('default')}
                            data-testid="a11y-font-default"
                        >
                            {t(
                                'accessibility.fontMode.default',
                                'Original font',
                            )}
                        </button>
                        <button
                            type="button"
                            className={styles.segmentBtn}
                            aria-pressed={preferences.fontMode === 'readable'}
                            onClick={() => setFontMode('readable')}
                            data-testid="a11y-font-readable"
                        >
                            {t(
                                'accessibility.fontMode.readable',
                                'Readable font',
                            )}
                        </button>
                    </div>
                </div>

                {/* C–G — Toggles */}
                <div className={styles.switchesList}>
                    {switches.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            role="switch"
                            aria-checked={item.checked}
                            className={styles.switchRow}
                            onClick={item.onToggle}
                            data-testid={item.testId}
                        >
                            <span className={styles.switchTextGroup}>
                                <span className={styles.switchTitle}>
                                    {item.label}
                                </span>
                                <span className={styles.switchDesc}>
                                    {item.description}
                                </span>
                            </span>
                            <span
                                className={styles.switchTrack}
                                data-active={item.checked ? 'true' : 'false'}
                                aria-hidden="true"
                            >
                                <span className={styles.switchThumb} />
                            </span>
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={resetPreferences}
                    data-testid="a11y-reset-button"
                >
                    {t('accessibility.reset', 'Reset all settings')}
                </button>
            </div>
        </div>
    );
};

export default AccessibilityWidget;
