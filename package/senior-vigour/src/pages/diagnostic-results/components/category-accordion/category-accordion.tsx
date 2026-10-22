import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';

import DownArrowIcon from '../../../../assets/icons/down_arrow.svg';
import BrownArrowIcon from '../../../../assets/icons/brown_arrow.svg';
import type { QuestionCategoryEnum } from '../../../../types/poll';

import styles from './category-accordion.module.scss';

export interface CategoryAccordionProps {
    category: QuestionCategoryEnum;
    categoryKey: string;
    title: string;
    icon: string;
    scoreOutOf10: number;
    feedbackText: string;
    isExpanded: boolean;
    onToggle: () => void;
    onGoToMaterials: (category: QuestionCategoryEnum, categoryKey: string) => void;
}

const CategoryAccordion: FC<CategoryAccordionProps> = ({
    category,
    categoryKey,
    title,
    icon,
    scoreOutOf10,
    feedbackText,
    isExpanded,
    onToggle,
    onGoToMaterials,
}) => {
    const { t } = useTranslate();

    return (
        <div
            className={styles.accordionCard}
            data-testid={`category-accordion-${category}`}
        >
            <button
                type="button"
                className={styles.accordionHeader}
                onClick={onToggle}
                aria-expanded={isExpanded}
                data-testid={`category-accordion-header-${category}`}
            >
                <div className={styles.headerLeft}>
                    <img
                        src={icon}
                        alt=""
                        aria-hidden="true"
                        className={styles.categoryIcon}
                    />
                    <div className={styles.titleAndScore}>
                        <span className={styles.categoryTitle}>{title}</span>
                        <span
                            className={styles.scoreLabel}
                            data-testid={`category-score-${category}`}
                        >
                            {t(
                                'diagnosticResults.pointsScored',
                                `Zdobyte punkty: ${scoreOutOf10}/10`,
                                { score: scoreOutOf10 }
                            )}
                        </span>
                    </div>
                </div>

                <img
                    src={DownArrowIcon}
                    alt=""
                    aria-hidden="true"
                    className={`${styles.chevron} ${
                        isExpanded ? styles.chevronExpanded : ''
                    }`}
                />
            </button>

            <div
                className={`${styles.accordionBodyWrapper} ${
                    isExpanded ? styles.accordionBodyExpanded : ''
                }`}
                aria-hidden={!isExpanded}
                data-testid={`category-accordion-content-${category}`}
            >
                <div className={styles.accordionBodyInner}>
                    {isExpanded && (
                        <div className={styles.accordionContent}>
                            <h3 className={styles.feedbackHeader}>
                                {t(
                                    'diagnosticResults.feedbackHeader',
                                    'FEEDBACK MESSAGES'
                                )}
                            </h3>
                            <p className={styles.feedbackText}>{feedbackText}</p>
                            <button
                                type="button"
                                className={styles.goToMaterialsLink}
                                onClick={() =>
                                    onGoToMaterials(category, categoryKey)
                                }
                                data-testid={`go-to-materials-${category}`}
                            >
                                <span>
                                    {t(
                                        'diagnosticResults.goToMaterials',
                                        'Go to materials'
                                    )}
                                </span>
                                <img
                                    src={BrownArrowIcon}
                                    alt=""
                                    aria-hidden="true"
                                    className={styles.materialsArrow}
                                />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryAccordion;
