import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';

import BlackArrowIcon from '../../../../assets/icons/black_arrow.svg';

import styles from './questionnaire-introduction.module.scss';

export interface QuestionnaireIntroductionProps {
    onStart?: () => void;
}

const QuestionnaireIntroduction: FC<QuestionnaireIntroductionProps> = ({ onStart }) => {
    const { t } = useTranslate();

    const handleStartClick = () => {
        if (onStart) {
            onStart();
        }
    };

    const points = [
        t('questionnaire.introduction.point1', '60 questions and activities'),
        t('questionnaire.introduction.point2', '6 areas of everyday well-being and development'),
        t(
            'questionnaire.introduction.point3',
            'Personalized educational path based on your answers'
        ),
    ];

    return (
        <div className={styles.introductionWrapper} data-testid="questionnaire-introduction">
            <h2 className={styles.heading}>
                {t('questionnaire.introduction.title', 'Discover Your Learning Needs')}
            </h2>

            <p className={styles.description}>
                {t(
                    'questionnaire.introduction.description',
                    'Complete the diagnostic test to identify which areas of knowledge may be most relevant to you. Based on your answers, the platform will suggest a suitable educational path.'
                )}
            </p>

            <ul className={styles.pointsList}>
                {points.map((point, index) => (
                    <li key={index} className={styles.pointItem}>
                        {point}
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className={styles.startButton}
                onClick={handleStartClick}
                data-testid="questionnaire-start-button"
            >
                <span>
                    {t('questionnaire.introduction.startButton', 'Discover Your Learning Needs')}
                </span>
                <img
                    src={BlackArrowIcon}
                    alt=""
                    aria-hidden="true"
                    className={styles.arrowIcon}
                />
            </button>
        </div>
    );
};

export default QuestionnaireIntroduction;
