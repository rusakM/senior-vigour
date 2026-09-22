import type { FC } from 'react';
import styles from './area-card.module.scss';
import VioletArrowIcon from '../../assets/icons/brown_arrow.svg';

export interface AreaCardProps {
    title: string;
    description: string;
    iconSrc: string;
    actionText?: string;
    onMoreClick?: () => void;
    additionalClasses?: string;
}

const AreaCard: FC<AreaCardProps> = ({
    title,
    description,
    iconSrc,
    actionText = 'Więcej',
    onMoreClick,
    additionalClasses,
}) => {
    const combinedClassName = [styles.card, additionalClasses || ''].filter(Boolean).join(' ');

    return (
        <article className={combinedClassName}>
            <div className={styles.imageContainer}>
                <img src={iconSrc} alt={title} className={styles.image} />
            </div>
            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.description}>{description}</p>
                <button
                    className={styles.actionLink}
                    onClick={onMoreClick}
                    type="button"
                >
                    <span>{actionText}</span>
                    <img src={VioletArrowIcon} alt="" aria-hidden="true" className={styles.actionArrow} />
                </button>
            </div>
        </article>
    );
};

export default AreaCard;
