import { useState, useRef, type FC } from 'react';
import { useTranslate } from '@tolgee/react';
import PrimaryButton from '../../../../components/primary-button/primary-button';
import { useMobile } from '../../../../helpers/responsiveContainers';
import { type LearningAreaItem, type LessonPlanItem } from '../../materials.data';
import { useItemsPerRow } from '../../hooks/use-items-per-row';
import DocIcon from '../../../../assets/materials/Group 392.svg';
import ArrowIcon from '../../../../assets/icons/black_arrow.svg';
import styles from './lesson-plans-section.module.scss';

export interface LessonPlansSectionProps {
    currentArea: LearningAreaItem;
    onDownload?: (item: LessonPlanItem) => void;
    onView?: (item: LessonPlanItem) => void;
}

const LessonPlansSection: FC<LessonPlansSectionProps> = ({
    currentArea,
    onDownload,
    onView,
}) => {
    const { t } = useTranslate();
    const isMobile = useMobile();
    const itemsPerRow = useItemsPerRow();

    const [activeIndex, setActiveIndex] = useState<number>(0);
    const touchStartX = useRef<number | null>(null);

    const totalItems = currentArea.lessonPlans.length;
    const maxStartIndex = Math.max(0, totalItems - itemsPerRow);
    const showArrows = totalItems > itemsPerRow;

    // Keep the active index within the valid range without updating state in an effect.
    const effectiveActiveIndex = Math.min(activeIndex, maxStartIndex);

    const handlePrev = () => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : maxStartIndex));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev < maxStartIndex ? prev + 1 : 0));
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;

        const diff = touchStartX.current - e.changedTouches[0].clientX;

        if (diff > 45) {
            handleNext();
        } else if (diff < -45) {
            handlePrev();
        }

        touchStartX.current = null;
    };

    const gap = isMobile ? 16 : 20;

    return (
        <section className={styles.section} aria-label="Lesson Plans">
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    {t('materials.lessonPlans.title', 'Lesson Plans')}
                </h2>

                <p className={styles.sectionSubtitle}>
                    {t(
                        isMobile
                            ? 'materials.lessonPlans.subtitleMobile'
                            : `materials.lessonPlans.${currentArea.translationKey}.subtitle`,
                        isMobile
                            ? currentArea.lessonPlansSubtitleMobile
                            : currentArea.lessonPlansSubtitleDesktop
                    )}
                </p>
            </div>

            <div className={styles.sliderContainer}>
                <div className={styles.sliderRow}>
                    {showArrows && (
                        <button
                            type="button"
                            className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
                            onClick={handlePrev}
                            aria-label={t(
                                'materials.slider.previous',
                                'Previous lesson plan'
                            )}
                            data-testid="lesson-plans-prev"
                        >
                            <img
                                src={ArrowIcon}
                                alt=""
                                className={styles.sliderArrowIcon}
                            />
                        </button>
                    )}

                    <div
                        className={styles.cardsWindow}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            className={styles.cardsTrack}
                            style={{
                                transform: `translateX(calc(-${effectiveActiveIndex} * ((100% + ${gap}px) / ${itemsPerRow})))`,
                                gap: `${gap}px`,
                            }}
                        >
                            {currentArea.lessonPlans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={styles.cardSlide}
                                    style={{
                                        flex: isMobile
                                            ? '0 0 100%'
                                            : `0 0 calc((100% - ${(itemsPerRow - 1) * gap}px) / ${itemsPerRow})`,
                                    }}
                                >
                                    <article className={styles.card}>
                                        <div className={styles.cardImageBox}>
                                            <img
                                                src={DocIcon}
                                                alt=""
                                                className={styles.cardDocIcon}
                                                role="presentation"
                                            />
                                        </div>

                                        <div className={styles.cardBody}>
                                            <h3 className={styles.cardTitle}>
                                                {plan.title}
                                            </h3>

                                            <p className={styles.cardDescription}>
                                                {plan.description}
                                            </p>

                                            <div className={styles.cardActions}>
                                                <PrimaryButton
                                                    color="violet"
                                                    rounded
                                                    onClick={() => onDownload?.(plan)}
                                                >
                                                    {t(
                                                        'materials.actions.download',
                                                        'Download'
                                                    )}
                                                </PrimaryButton>

                                                <PrimaryButton
                                                    color="white"
                                                    rounded
                                                    additionalClasses={styles.viewButton}
                                                    onClick={() => onView?.(plan)}
                                                >
                                                    {t(
                                                        'materials.actions.view',
                                                        'View'
                                                    )}
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    </article>
                                </div>
                            ))}
                        </div>
                    </div>

                    {showArrows && (
                        <button
                            type="button"
                            className={styles.sliderArrow}
                            onClick={handleNext}
                            aria-label={t(
                                'materials.slider.next',
                                'Next lesson plan'
                            )}
                            data-testid="lesson-plans-next"
                        >
                            <img
                                src={ArrowIcon}
                                alt=""
                                className={styles.sliderArrowIcon}
                            />
                        </button>
                    )}
                </div>

                {isMobile && totalItems > 1 && (
                    <div className={styles.sliderDots} role="tablist">
                        {currentArea.lessonPlans.map((_, dotIndex) => (
                            <button
                                key={dotIndex}
                                type="button"
                                className={`${styles.dot} ${
                                    dotIndex === effectiveActiveIndex
                                        ? styles.dotActive
                                        : ''
                                }`}
                                onClick={() => setActiveIndex(dotIndex)}
                                aria-label={t(
                                    'materials.slider.goToSlide',
                                    `Go to slide ${dotIndex + 1}`,
                                    { index: dotIndex + 1 }
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default LessonPlansSection;