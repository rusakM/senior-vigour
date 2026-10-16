import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';
import { useMobile } from '../../../../helpers/responsiveContainers';
import { LEARNING_AREAS_DATA, type LearningAreaItem } from '../../materials.data';
import { useSwipeScroll } from '../../hooks/use-swipe-scroll';
import styles from './category-selector.module.scss';

export interface CategorySelectorProps {
    selectedAreaKey: string;
    onSelectArea: (key: string) => void;
    currentArea: LearningAreaItem;
}

const CategorySelector: FC<CategorySelectorProps> = ({
    selectedAreaKey,
    onSelectArea,
    currentArea,
}) => {
    const { t } = useTranslate();
    const isMobile = useMobile();

    const {
        scrollRef: desktopScrollRef,
        onMouseDown: onDesktopMouseDown,
        onMouseLeave: onDesktopMouseLeave,
        onMouseUp: onDesktopMouseUp,
        onMouseMove: onDesktopMouseMove,
        onClickCapture: onDesktopClickCapture,
    } = useSwipeScroll<HTMLDivElement>(selectedAreaKey);

    const {
        scrollRef: mobileScrollRef,
        onMouseDown: onMobileMouseDown,
        onMouseLeave: onMobileMouseLeave,
        onMouseUp: onMobileMouseUp,
        onMouseMove: onMobileMouseMove,
        onClickCapture: onMobileClickCapture,
    } = useSwipeScroll<HTMLDivElement>(selectedAreaKey);

    if (isMobile) {
        return (
            <div className={styles.mobileCategoriesContainer}>
                <div
                    className={styles.mobileCategoriesIconsRow}
                    role="tablist"
                    ref={mobileScrollRef}
                    onMouseDown={onMobileMouseDown}
                    onMouseLeave={onMobileMouseLeave}
                    onMouseUp={onMobileMouseUp}
                    onMouseMove={onMobileMouseMove}
                    onClickCapture={onMobileClickCapture}
                >
                    {LEARNING_AREAS_DATA.map((area) => {
                        const isActive = area.key === selectedAreaKey;
                        return (
                            <button
                                key={area.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                className={`${styles.mobileCategoryBtn} ${
                                    isActive ? styles.mobileCategoryBtnActive : ''
                                }`}
                                onClick={() => onSelectArea(area.key)}
                                title={t(`materials.categories.${area.translationKey}`, area.title)}
                                data-testid={`category-btn-${area.key}`}
                            >
                                <img src={area.iconSrc} alt={area.title} />
                            </button>
                        );
                    })}
                </div>
                <h2 className={styles.mobileCategoryTitle}>
                    {t(`materials.categories.${currentArea.translationKey}`, currentArea.title)}
                </h2>
            </div>
        );
    }

    return (
        <div className={styles.categoriesDesktopScrollWrapper}>
            <div
                className={styles.categoriesDesktopRow}
                role="tablist"
                ref={desktopScrollRef}
                onMouseDown={onDesktopMouseDown}
                onMouseLeave={onDesktopMouseLeave}
                onMouseUp={onDesktopMouseUp}
                onMouseMove={onDesktopMouseMove}
                onClickCapture={onDesktopClickCapture}
            >
                {LEARNING_AREAS_DATA.map((area) => {
                    const isActive = area.key === selectedAreaKey;
                    return (
                        <button
                            key={area.key}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            className={`${styles.categoryCard} ${
                                isActive ? styles.categoryCardActive : ''
                            }`}
                            onClick={() => onSelectArea(area.key)}
                            data-testid={`category-btn-${area.key}`}
                        >
                            <img
                                src={area.iconSrc}
                                alt={area.title}
                                className={styles.categoryIcon}
                            />
                            <div className={styles.categoryText}>
                                <span className={styles.categoryTitle}>
                                    {t(
                                        `materials.categories.${area.translationKey}`,
                                        area.title
                                    )}
                                </span>
                                <span className={styles.categoryCount}>
                                    {t(
                                        'materials.category.count',
                                        `${area.materialsCount} Materials`,
                                        { count: area.materialsCount }
                                    )}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategorySelector;
