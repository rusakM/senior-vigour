import { useState, useEffect, type FC } from 'react';
import { useTranslate } from '@tolgee/react';
import PrimaryButton from '../../../../components/primary-button/primary-button';
import { useMobile } from '../../../../helpers/responsiveContainers';
import { type LearningAreaItem, type InfographicItem } from '../../materials.data';
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
    const [activeIndex, setActiveIndex] = useState<number>(0);

    // Reset slide index when category changes
    useEffect(() => {
        setActiveIndex(0);
    }, [currentArea.key]);

    const handlePrev = () => {
        setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : currentArea.infographics.length - 1
        );
    };

    const handleNext = () => {
        setActiveIndex((prev) =>
            prev < currentArea.infographics.length - 1 ? prev + 1 : 0
        );
    };

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
                            ? `materials.area.${currentArea.key}.infographicsSubtitleMobile`
                            : `materials.area.${currentArea.key}.infographicsSubtitleDesktop`,
                        isMobile
                            ? currentArea.infographicsSubtitleMobile
                            : currentArea.infographicsSubtitleDesktop
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
                            aria-label="Previous resource"
                            data-testid="infographics-prev"
                        >
                            <img
                                src={ArrowIcon}
                                alt=""
                                className={styles.sliderArrowIcon}
                            />
                        </button>

                        <div className={styles.sliderCardWrapper}>
                            {(() => {
                                const item = currentArea.infographics[activeIndex];
                                if (!item) return null;
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
                                                    {t('materials.button.download', 'Download')}
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
                            aria-label="Next resource"
                            data-testid="infographics-next"
                        >
                            <img
                                src={ArrowIcon}
                                alt=""
                                className={styles.sliderArrowIcon}
                            />
                        </button>
                    </div>

                    <div className={styles.sliderDots} role="tablist">
                        {currentArea.infographics.map((_, dotIndex) => (
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
                    {currentArea.infographics.map((item) => (
                        <article key={item.id} className={styles.card}>
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
                                <p className={styles.cardDescription}>{item.description}</p>
                                <div className={styles.cardActions}>
                                    <PrimaryButton
                                        color="violet"
                                        rounded
                                        additionalClasses={styles.singleDownloadButton}
                                        onClick={() => onDownload?.(item)}
                                    >
                                        {t('materials.button.download', 'Download')}
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

export default ResourcesSection;
