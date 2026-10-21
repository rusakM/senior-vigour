import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';

import LeftArrowIcon from '../../assets/icons/left.svg';
import styles from './questionnaire-header.module.scss';

export interface QuestionnaireHeaderProps {
    title: string;
    onQuit: () => void;
    progressPercent?: number;
    currentQuestionNumber?: number;
    totalQuestions?: number;
}

const QuestionnaireHeader: FC<QuestionnaireHeaderProps> = ({
    title,
    onQuit,
    progressPercent = 45,
    currentQuestionNumber,
    totalQuestions,
}) => {
    const { t } = useTranslate();
    const clampedProgress = Math.max(0, Math.min(100, progressPercent));
    const showQuestionCounter =
        typeof currentQuestionNumber === 'number' &&
        currentQuestionNumber > 0 &&
        typeof totalQuestions === 'number' &&
        totalQuestions > 0;

    return (
        <header className={styles.headerOuter} data-testid="questionnaire-header">
            <div className={styles.headerBanner}>
                <div className={styles.topBar}>
                    <button
                        type="button"
                        className={styles.quitButton}
                        onClick={onQuit}
                        data-testid="questionnaire-quit-button"
                    >
                        <img
                            src={LeftArrowIcon}
                            alt=""
                            className={styles.quitIcon}
                            aria-hidden="true"
                        />
                        <span>{t('questionnaire.header.quitTest', 'QUIT TEST')}</span>
                    </button>

                    <h1 className={styles.title}>{title}</h1>

                    {showQuestionCounter && (
                        <span
                            className={styles.questionCounter}
                            data-testid="questionnaire-question-counter"
                        >
                            {t(
                                'questionnaire.header.questionCounter',
                                `QUESTION ${currentQuestionNumber} of ${totalQuestions}`,
                                { current: currentQuestionNumber, total: totalQuestions }
                            )}
                        </span>
                    )}
                </div>

                <div className={styles.progressTrack}>
                    <div
                        className={styles.progressBar}
                        style={{ width: `${clampedProgress}%` }}
                        data-testid="questionnaire-progress-bar"
                    />
                </div>
            </div>
        </header>
    );
};

export default QuestionnaireHeader;

