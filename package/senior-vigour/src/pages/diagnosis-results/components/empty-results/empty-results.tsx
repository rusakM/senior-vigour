import { type FC } from 'react';
import { useTranslate } from '@tolgee/react';

import styles from './empty-results.module.scss';

export interface EmptyResultsProps {
    onStartTest: () => void;
}

const EmptyResults: FC<EmptyResultsProps> = ({ onStartTest }) => {
    const { t } = useTranslate();

    return (
        <div className={styles.emptyContainer} data-testid="diagnosis-empty-results">
            <h2 className={styles.emptyTitle}>
                {t('diagnosisResults.emptyTitle', 'No diagnostic results yet')}
            </h2>
            <p className={styles.emptyDescription}>
                {t(
                    'diagnosisResults.emptyDescription',
                    'You have not completed any self-assessment tests yet. Complete the diagnostic test to identify your learning needs and receive personalized recommendations.'
                )}
            </p>
            <button
                type="button"
                className={styles.startTestButton}
                onClick={onStartTest}
                data-testid="start-diagnostic-test-btn"
            >
                {t('diagnosisResults.startTestButton', 'Start self-assessment')}
            </button>
        </div>
    );
};

export default EmptyResults;
