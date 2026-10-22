import { type FC } from 'react';
import { useTranslate } from '@tolgee/react';

import BlackArrowIcon from '../../../../assets/icons/black_arrow.svg';
import type { IPlayerPoll } from '../../../../types/poll';
import { formatPollDate } from '../../diagnosis-results.utils';

import styles from './result-card.module.scss';

export interface ResultCardProps {
    poll: IPlayerPoll;
    onClick: () => void;
}

const ResultCard: FC<ResultCardProps> = ({ poll, onClick }) => {
    const { t } = useTranslate();

    const seniorName = `${poll.firstName || ''} ${poll.lastName || ''}`.trim() || 'Senior';
    const dateFormatted = formatPollDate(poll.createdAt || poll.updatedAt);

    return (
        <button
            type="button"
            className={styles.card}
            onClick={onClick}
            data-testid="diagnosis-result-card"
            aria-label={t(
                'diagnosisResults.aria.viewDetails',
                `View results for ${seniorName} from ${dateFormatted}`,
                { name: seniorName, date: dateFormatted }
            )}
        >
            <span className={styles.seniorName}>{seniorName}</span>
            <div className={styles.rightSection}>
                <span className={styles.date}>{dateFormatted}</span>
                <img
                    src={BlackArrowIcon}
                    alt=""
                    className={styles.arrowIcon}
                    aria-hidden="true"
                />
            </div>
        </button>
    );
};

export default ResultCard;
