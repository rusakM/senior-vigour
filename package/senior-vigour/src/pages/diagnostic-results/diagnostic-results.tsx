import { type FC, useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import BackgroundShapes from '../../components/background-shapes/background-shapes';
import DiagnosticBanner from './components/diagnostic-banner/diagnostic-banner';
import CategoryAccordion from './components/category-accordion/category-accordion';
import NotFound from '../not-found/not-found';
import {
    DIAGNOSTIC_CATEGORIES_CONFIG,
    getCompetenceLevel,
} from './diagnostic-results.constants';

import { constantsUrls } from '../../helpers/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    selectActivePoll,
    selectPollQuestions,
    selectPollError,
} from '../../redux/poll/poll.selectors';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
    fetchPlayerPollStart,
    fetchQuestionsStart,
} from '../../redux/poll/poll.actions';
import type { QuestionCategoryEnum } from '../../types/poll';

import styles from './diagnostic-results.module.scss';

const DiagnosticResults: FC = () => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { playerPollId } = useParams<{ playerPollId: string }>();

    const activePoll = useAppSelector(selectActivePoll);
    const questions = useAppSelector(selectPollQuestions);
    const pollError = useAppSelector(selectPollError);
    const currentUser = useAppSelector(selectCurrentUser);

    const isPollBelongingToOtherUser = useMemo(() => {
        if (!activePoll || !currentUser) return false;
        const isOwner = activePoll.playerId === currentUser._id;
        const isMentor = activePoll.mentorId === currentUser._id;
        return !isOwner && !isMentor;
    }, [activePoll, currentUser]);

    const [expandedCategoryKey, setExpandedCategoryKey] =
        useState<QuestionCategoryEnum | null>(null);

    useEffect(() => {
        if (
            playerPollId &&
            !pollError &&
            (!activePoll || activePoll._id !== playerPollId)
        ) {
            dispatch(fetchPlayerPollStart(playerPollId));
        }
    }, [playerPollId, activePoll, pollError, dispatch]);

    useEffect(() => {
        if (!pollError && questions.length === 0) {
            dispatch(fetchQuestionsStart());
        }
    }, [questions.length, pollError, dispatch]);

    const sortedCategories = useMemo(() => {
        const itemsWithScore = DIAGNOSTIC_CATEGORIES_CONFIG.map((cfg, index) => {
            const categoryScoreEntry = activePoll?.categoryScores?.find(
                (cs) => cs.category === cfg.category
            );

            const categoryPoints =
                categoryScoreEntry !== undefined
                    ? categoryScoreEntry.points
                    : (activePoll?.answers
                          ?.filter((a) => a.category === cfg.category)
                          .reduce((sum, a) => sum + (a.points || 0), 0) ?? 0);

            const questionsInCategory = questions.filter(
                (q) => q.category === cfg.category
            );
            const totalQuestions =
                questionsInCategory.length > 0 ? questionsInCategory.length : 10;

            const rawNormalized = Math.round(
                (categoryPoints / totalQuestions) * 10
            );
            const scoreOutOf10 = Math.max(0, Math.min(10, rawNormalized));
            const level = getCompetenceLevel(scoreOutOf10);

            return {
                ...cfg,
                scoreOutOf10,
                level,
                originalIndex: index,
            };
        });

        return itemsWithScore.sort((a, b) => {
            if (a.scoreOutOf10 !== b.scoreOutOf10) {
                return a.scoreOutOf10 - b.scoreOutOf10;
            }
            return a.originalIndex - b.originalIndex;
        });
    }, [activePoll, questions]);

    const handleToggleCategory = (category: QuestionCategoryEnum) => {
        setExpandedCategoryKey((prev) => (prev === category ? null : category));
    };

    const handleGoToMaterials = (
        category: QuestionCategoryEnum,
        categoryKey: string
    ) => {
        navigate(constantsUrls.Main.materials, {
            state: {
                category,
                categoryKey,
            },
        });
    };

    const handleClose = () => {
        navigate(constantsUrls.LandingPage.main);
    };

    if (!playerPollId || pollError || isPollBelongingToOtherUser) {
        return <NotFound />;
    }

    return (
        <div className={styles.pageWrapper} data-testid="diagnostic-results-page">
            <BackgroundShapes />

            <main className={styles.contentContainer}>
                <DiagnosticBanner />

                <div
                    className={styles.categoriesList}
                    data-testid="diagnostic-categories-list"
                >
                    {sortedCategories.map((item) => {
                        const feedbackEntry = item.feedback[item.level];
                        return (
                            <CategoryAccordion
                                key={item.category}
                                category={item.category}
                                categoryKey={item.categoryKey}
                                title={t(item.titleKey, item.defaultTitle)}
                                icon={item.icon}
                                scoreOutOf10={item.scoreOutOf10}
                                feedbackText={t(
                                    feedbackEntry.key,
                                    feedbackEntry.defaultText
                                )}
                                isExpanded={expandedCategoryKey === item.category}
                                onToggle={() =>
                                    handleToggleCategory(item.category)
                                }
                                onGoToMaterials={handleGoToMaterials}
                            />
                        );
                    })}
                </div>

                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={handleClose}
                    data-testid="diagnostic-results-close-btn"
                >
                    {t(
                        'diagnosticResults.closeButton',
                        'Close and return to the home page'
                    )}
                </button>
            </main>
        </div>
    );
};

export default DiagnosticResults;
