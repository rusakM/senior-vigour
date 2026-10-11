import { useState, useEffect, type FC } from 'react';
import { useTranslate } from '@tolgee/react';
import PrimaryButton from '../../../../components/primary-button/primary-button';
import { useMobile } from '../../../../helpers/responsiveContainers';
import { type LearningAreaItem, type LessonPlanItem } from '../../materials.data';
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
    const [activeIndex, setActiveIndex] = useState<number>(0);

    // Reset slide index when category changes
    useEffect(() => {
        setActiveIndex(0);
    }, [currentArea.key]);

    const handlePrev = () => {
        setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : currentArea.lessonPlans.length - 1
        );
    };

    const handleNext = () => {
        setActiveIndex((prev) =>
            prev < currentArea.lessonPlans.length - 1 ? prev + 1 : 0
        );
    };

    return (
        <section className={styles.section} aria-label="Lesson Plans">
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    {t('materials.lessonPlans.title', 'Lesson Plans')}
                </h2>
                <p className={styles.sectionSubtitle}>
                    {t(
                        `materials.area.${currentArea.key}.lessonPlansSubtitle`,
                        isMobile
                            ? currentArea.lessonPlansSubtitleMobile
                            : currentArea.lessonPlansSubtitleDesktop
                    )}
                </p>
            </div>

            {isMobile ? (
                <div className={styles.mobileSliderContainer}>
                    <div className={styles.sliderRow}>
                        <button
                            type="button"
                            className={`${styles.sliderArrow} ${styles.sliderArrowLeft}`}
                            onClick={handlePrev}
                            aria-label="Previous lesson plan"
                            data-testid="lesson-plans-prev"
                        >
                            <img
                                src={ArrowIcon}
                                alt=""
                                className={styles.sliderArrowIcon}
                            />
                        </button>

                        <div className={styles.sliderCardWrapper}>
                            {(() => {
                                const plan = currentArea.lessonPlans[activeIndex];
                                if (!plan) return null;
                                return (
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
                                            <h3 className={styles.cardTitle}>{plan.title}</h3>
                                            <p className={styles.cardDescription}>
                                                {plan.description}
                                            </p>
                                            <div className={styles.cardActions}>
                                                <PrimaryButton
                                                    color="violet"
                                                    rounded
                                                    onClick={() => onDownload?.(plan)}
                                                >
                                                    {t('materials.button.download', 'Download')}
                                                </PrimaryButton>
                                                <PrimaryButton
                                                    color="white"
                                                    rounded
                                                    additionalClasses={styles.viewButton}
                                                    onClick={() => onView?.(plan)}
                                                >
                                                    {t('materials.button.view', 'View')}
                                                </PrimaryButton>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })()}
                        </div>

                        <button
                            type="button"
                            className={styles.sliderArrow}
                            onClick={handleNext}
                            aria-label="Next lesson plan"
                            data-testid="lesson-plans-next"
                        >
                            <img
                                src={ArrowIcon}
                                alt=""
                                className={styles.sliderArrowIcon}
                            />
                        </button>
                    </div>

                    <div className={styles.sliderDots} role="tablist">
                        {currentArea.lessonPlans.map((_, dotIndex) => (
                            <button
                                key={dotIndex}
                                type="button"
                                className={`${styles.dot} ${
                                    dotIndex === activeIndex ? styles.dotActive : ''
                                }`}
                                onClick={() => setActiveIndex(dotIndex)}
                                aria-label={`Go to slide ${dotIndex + 1}`}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className={styles.desktopCardsGrid}>
                    {currentArea.lessonPlans.map((plan) => (
                        <article key={plan.id} className={styles.card}>
                            <div className={styles.cardImageBox}>
                                <img
                                    src={DocIcon}
                                    alt=""
                                    className={styles.cardDocIcon}
                                    role="presentation"
                                />
                            </div>
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardTitle}>{plan.title}</h3>
                                <p className={styles.cardDescription}>{plan.description}</p>
                                <div className={styles.cardActions}>
                                    <PrimaryButton
                                        color="violet"
                                        rounded
                                        onClick={() => onDownload?.(plan)}
                                    >
                                        {t('materials.button.download', 'Download')}
                                    </PrimaryButton>
                                    <PrimaryButton
                                        color="white"
                                        rounded
                                        additionalClasses={styles.viewButton}
                                        onClick={() => onView?.(plan)}
                                    >
                                        {t('materials.button.view', 'View')}
                                    </PrimaryButton>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default LessonPlansSection;
