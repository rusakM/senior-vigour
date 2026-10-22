import { type FC, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import ResultCard from './components/result-card/result-card';
import EmptyResults from './components/empty-results/empty-results';

import { constantsUrls } from '../../helpers/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    selectPlayerPolls,
} from '../../redux/poll/poll.selectors';
import { fetchPlayerPollsStart } from '../../redux/poll/poll.actions';
import { PollStatusEnum } from '../../types/poll';

import styles from './diagnosis-results.module.scss';

const DiagnosisResults: FC = () => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const playerPolls = useAppSelector(selectPlayerPolls);

    useEffect(() => {
        dispatch(fetchPlayerPollsStart());
    }, [dispatch]);

    const finishedPolls = useMemo(() => {
        const filtered = (playerPolls || []).filter(
            (poll) => poll.status === PollStatusEnum.FINISHED
        );

        return filtered.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.updatedAt || 0).getTime();
            const timeB = new Date(b.createdAt || b.updatedAt || 0).getTime();
            return timeB - timeA;
        });
    }, [playerPolls]);

    const handleCardClick = (pollId: string) => {
        navigate(constantsUrls.Main.pollResults.replace(':playerPollId', pollId));
    };

    const handleStartTest = () => {
        navigate(constantsUrls.Main.diagnosticTest);
    };

    return (
        <div className={styles.pageWrapper} data-testid="diagnosis-results-page">
            <BackgroundShapes />
            <Header />

            <main className={styles.mainContainer}>
                <div className={styles.headerSection}>
                    <h1 className={styles.title}>
                        {t('diagnosisResults.title', 'Diagnosis results')}
                    </h1>
                    <p className={styles.subtitle}>
                        {t(
                            'diagnosisResults.subtitle',
                            'Here you will find all saved diagnostic results along with recommendations'
                        )}
                    </p>
                </div>

                <div className={styles.listContainer}>
                    {finishedPolls.length > 0 ? (
                        <div
                            className={styles.resultsList}
                            data-testid="diagnosis-results-list"
                        >
                            {finishedPolls.map((poll) => (
                                <ResultCard
                                    key={poll._id}
                                    poll={poll}
                                    onClick={() => handleCardClick(poll._id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <EmptyResults onStartTest={handleStartTest} />
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DiagnosisResults;
