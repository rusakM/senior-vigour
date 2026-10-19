import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';

import LeftArrowIcon from '../../assets/icons/left.svg';
import styles from './questionnaire-header.module.scss';

export interface QuestionnaireHeaderProps {
    title: string;
    onQuit: () => void;
    progressPercent?: number;
}

const QuestionnaireHeader: FC<QuestionnaireHeaderProps> = ({
    title,
    onQuit,
    progressPercent = 45,
}) => {
    const { t } = useTranslate();
    const clampedProgress = Math.max(0, Math.min(100, progressPercent));

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
