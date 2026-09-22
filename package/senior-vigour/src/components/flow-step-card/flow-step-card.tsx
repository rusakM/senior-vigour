import type { FC } from 'react';
import styles from './flow-step-card.module.scss';

export interface FlowStepCardProps {
    stepNumber: number;
    title?: string;
    description: string;
    imageSrc: string;
    reversed?: boolean;
    additionalClasses?: string;
}

const FlowStepCard: FC<FlowStepCardProps> = ({
    stepNumber,
    title,
    description,
    imageSrc,
    reversed = false,
    additionalClasses,
}) => {
    const combinedClassName = [
        styles.card,
        reversed ? styles.reversed : '',
        additionalClasses || '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <article className={combinedClassName}>
            <div className={styles.imageContainer}>
                <img
                    src={imageSrc}
                    alt={title ? `${stepNumber}. ${title}` : `${stepNumber}. ${description}`}
                    className={styles.image}
                />
            </div>
            <div className={styles.textContent}>
                <p className={styles.text}>
                    <span className={styles.stepNumber}>{stepNumber}</span>.{' '}
                    {title && <span className={styles.title}>{title} </span>}
                    <span className={styles.description}>{description}</span>
                </p>
            </div>
        </article>
    );
};

export default FlowStepCard;
