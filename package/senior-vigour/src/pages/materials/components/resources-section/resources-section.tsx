import { useState, useEffect, useRef, type FC } from 'react';
import { useTranslate } from '@tolgee/react';
import PrimaryButton from '../../../../components/primary-button/primary-button';
import { useMobile } from '../../../../helpers/responsiveContainers';
import { type LearningAreaItem, type InfographicItem } from '../../materials.data';
import { useItemsPerRow } from '../../hooks/use-items-per-row';
import DocIcon from '../../../../assets/materials/Group 392.svg';
import ArrowIcon from '../../../../assets/icons/black_arrow.svg';
import styles from './resources-section.module.scss';

export interface ResourcesSectionProps {
    currentArea: LearningAreaItem;
    onDownload?: (item: InfographicItem) => void;
}

const ResourcesSection: FC<ResourcesSectionProps> = ({ currentArea, onDownload }) => {
    const { t } = useTranslate();
    const isMobile = useMobile();
    const itemsPerRow = useItemsPerRow();

    const [activeIndex, setActiveIndex] = useState<number>(0);
    const touchStartX = useRef<number | null>(null);

    const totalItems = currentArea.infographics.length;
    const maxStartIndex = Math.max(0, totalItems - itemsPerRow);
    const showArrows = totalItems > itemsPerRow;

    // Reset slide index when category changes
    useEffect(() => {
        setActiveIndex(0);
    }, [currentArea.key]);

    // Ensure activeIndex is within bounds if screen resized
    useEffect(() => {
        setActiveIndex((prev) => Math.min(prev, maxStartIndex));
    }, [maxStartIndex]);

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
        <section
            className={styles.section}
            aria-label={isMobile ? 'Downloadable Resources' : 'Infographics'}
        >
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                    {t(
                        isMobile
                            ? 'materials.infographics.titleMobile'
                            : 'materials.infographics.titleDesktop',
                        isMobile
                            ? currentArea.infographicsTitleMobile
                            : currentArea.infographicsTitleDesktop
                    )}
                </h2>
                <p className={styles.sectionSubtitle}>
                    {t(
                        isMobile
                            ? 'materials.infographics.subtitleMobile'
                            : `materials.infographics.${currentArea.translationKey}.subtitle`,
                        isMobile
                            ? currentArea.infographicsSubtitleMobile
                            : currentArea.infographicsSubtitleDesktop
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
                            aria-label={t('materials.slider.previous', 'Previous resource')}
                            data-testid="infographics-prev"
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
                                transform: `translateX(calc(-${activeIndex} * ((100% + ${gap}px) / ${itemsPerRow})))`,
                                gap: `${gap}px`,
                            }}
                        >
                            {currentArea.infographics.map((item) => (
                                <div
                                    key={item.id}
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
                                            <h3 className={styles.cardTitle}>{item.title}</h3>
                                            <p className={styles.cardDescription}>
                                                {item.description}
                                            </p>
                                            <div className={styles.cardActions}>
                                                <PrimaryButton
                                                    color="violet"
                                                    rounded
                                                    additionalClasses={styles.singleDownloadButton}
                                                    onClick={() => onDownload?.(item)}
                                                >
                                                    {t('materials.actions.download', 'Download')}
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
                            aria-label={t('materials.slider.next', 'Next resource')}
                            data-testid="infographics-next"
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
                        {currentArea.infographics.map((_, dotIndex) => (
                            <button
                                key={dotIndex}
                                type="button"
                                className={`${styles.dot} ${
                                    dotIndex === activeIndex ? styles.dotActive : ''
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

export default ResourcesSection;
