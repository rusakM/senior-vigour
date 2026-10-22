import type { FC, ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryContainer from '../../components/primary-container/primary-container';
import QuestionnaireHeader from '../../components/questionnaire-header/questionnaire-header';
import SeniorDetailsForm, {
    type ISeniorDetails,
} from './components/senior-details-form/senior-details-form';
import QuestionnaireIntroduction from './components/questionnaire-introduction/questionnaire-introduction';
import QuestionRenderer from './components/questions/question-renderer';
import { POLL_CATEGORY_TRANSLATION_MAP } from './questionnaire.constants';

import { constantsUrls } from '../../helpers/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
    selectActivePoll,
    selectCurrentQuestion,
    selectCurrentQuestionIndex,
    selectIsSubmittingAnswer,
    selectPollQuestions,
    selectSeniorDetails,
} from '../../redux/poll/poll.selectors';
import {
    resetPollState,
    setSeniorDetails as setSeniorDetailsAction,
    startPollStart,
    submitAnswerStart,
} from '../../redux/poll/poll.actions';
import { PollStatusEnum } from '../../types/poll';
import { UserRoleEnum } from '../../types/user';

import styles from './questionnaire.module.scss';

export interface QuestionnaireProps {
    onSubmitSeniorDetails?: (details: ISeniorDetails) => void;
    onStartTest?: () => void;
    headerTitle?: string;
    progressPercent?: number;
    children?: ReactNode;
}

const Questionnaire: FC<QuestionnaireProps> = ({
    onSubmitSeniorDetails,
    onStartTest,
    headerTitle,
    progressPercent,
    children,
}) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(selectCurrentUser);
    const activePoll = useAppSelector(selectActivePoll);
    const questions = useAppSelector(selectPollQuestions);
    const currentQuestion = useAppSelector(selectCurrentQuestion);
    const currentQuestionIndex = useAppSelector(selectCurrentQuestionIndex);
    const isSubmittingAnswer = useAppSelector(selectIsSubmittingAnswer);
    const reduxSeniorDetails = useAppSelector(selectSeniorDetails);

    const [seniorDetails, setSeniorDetails] = useState<ISeniorDetails | null>(
        reduxSeniorDetails
    );

    const isUnauthenticated = !currentUser;
    const isMentor = currentUser?.role === UserRoleEnum.MENTOR;

    useEffect(() => {
        if (isUnauthenticated) {
            navigate(constantsUrls.LandingPage.signIn, { replace: true });
        }
    }, [isUnauthenticated, navigate]);

    const isPollFinished =
        activePoll?.status === PollStatusEnum.FINISHED ||
        Boolean(
            activePoll &&
                questions.length > 0 &&
                currentQuestionIndex >= questions.length
        );

    useEffect(() => {
        if (!isUnauthenticated && isPollFinished && activePoll) {
            navigate(
                constantsUrls.Main.pollResults.replace(
                    ':playerPollId',
                    activePoll._id
                )
            );
        }
    }, [isUnauthenticated, isPollFinished, activePoll, navigate]);

    if (isUnauthenticated) {
        return null;
    }

    const handleBackToMaterials = () => {
        dispatch(resetPollState());
        navigate(constantsUrls.Main.materials);
    };

    const handleSeniorDetailsSubmit = (details: ISeniorDetails) => {
        setSeniorDetails(details);
        dispatch(setSeniorDetailsAction(details));
        if (onSubmitSeniorDetails) {
            onSubmitSeniorDetails(details);
        }
    };

    const handleStartTest = () => {
        if (onStartTest) {
            onStartTest();
        }
        const resolvedSeniorDetails = seniorDetails ?? reduxSeniorDetails;
        dispatch(startPollStart(resolvedSeniorDetails ?? undefined));
    };

    const handleSubmitAnswer = (response: string) => {
        if (!activePoll || !currentQuestion) return;
        dispatch(
            submitAnswerStart({
                playerPollId: activePoll._id,
                questionNumber: currentQuestion.questionNumber,
                response,
            })
        );
    };

    if (isMentor && !seniorDetails && !reduxSeniorDetails && !activePoll) {
        return (
            <SeniorDetailsForm
                onSubmit={handleSeniorDetailsSubmit}
                onBack={handleBackToMaterials}
            />
        );
    }

    const isQuestionActive = Boolean(
        activePoll &&
            activePoll.status === PollStatusEnum.STARTED &&
            currentQuestion
    );

    const categoryTranslation =
        isQuestionActive && currentQuestion
            ? POLL_CATEGORY_TRANSLATION_MAP[currentQuestion.category]
            : undefined;

    const resolvedHeaderTitle =
        headerTitle ||
        (categoryTranslation
            ? t(categoryTranslation.key, categoryTranslation.defaultText)
            : t('questionnaire.header.introduction', 'Introduction'));

    const resolvedProgressPercent =
        progressPercent ??
        (isQuestionActive && questions.length > 0
            ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100)
            : 45);

    return (
        <div className={styles.pageWrapper} data-testid="questionnaire-page">
            <BackgroundShapes />

            <QuestionnaireHeader
                title={resolvedHeaderTitle}
                onQuit={handleBackToMaterials}
                progressPercent={resolvedProgressPercent}
                currentQuestionNumber={
                    isQuestionActive ? currentQuestionIndex + 1 : undefined
                }
                totalQuestions={isQuestionActive ? questions.length : undefined}
            />

            <PrimaryContainer
                direction="column"
                contentAlignment="center"
                contentJustify="center"
                width="desktopFit"
                additionalClasses={styles.presentationContainer}
            >
                <div
                    className={styles.universalContentContainer}
                    data-testid="questionnaire-content-container"
                >
                    {children ??
                        (isQuestionActive && currentQuestion ? (
                            <QuestionRenderer
                                question={currentQuestion}
                                isSubmitting={isSubmittingAnswer}
                                onSubmitAnswer={handleSubmitAnswer}
                            />
                        ) : (
                            <QuestionnaireIntroduction onStart={handleStartTest} />
                        ))}
                </div>
            </PrimaryContainer>
        </div>
    );
};

export default Questionnaire;
