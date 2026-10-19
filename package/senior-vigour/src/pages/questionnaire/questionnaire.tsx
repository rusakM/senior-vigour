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

import { constantsUrls } from '../../helpers/constants';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/user/user.selectors';
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
    progressPercent = 45,
    children,
}) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const currentUser = useAppSelector(selectCurrentUser);

    const [seniorDetails, setSeniorDetails] = useState<ISeniorDetails | null>(null);

    const isUnauthenticated = !currentUser;
    const isMentor = currentUser?.role === UserRoleEnum.MENTOR;

    useEffect(() => {
        if (isUnauthenticated) {
            navigate(constantsUrls.LandingPage.signIn, { replace: true });
        }
    }, [isUnauthenticated, navigate]);

    if (isUnauthenticated) {
        return null;
    }

    const handleBackToMaterials = () => {
        navigate(constantsUrls.Main.materials);
    };

    const handleSeniorDetailsSubmit = (details: ISeniorDetails) => {
        setSeniorDetails(details);
        if (onSubmitSeniorDetails) {
            onSubmitSeniorDetails(details);
        }
    };

    if (isMentor && !seniorDetails) {
        return (
            <SeniorDetailsForm
                onSubmit={handleSeniorDetailsSubmit}
                onBack={handleBackToMaterials}
            />
        );
    }

    const resolvedHeaderTitle =
        headerTitle || t('questionnaire.header.introduction', 'Introduction');

    return (
        <div className={styles.pageWrapper} data-testid="questionnaire-page">
            <BackgroundShapes />

            <QuestionnaireHeader
                title={resolvedHeaderTitle}
                onQuit={handleBackToMaterials}
                progressPercent={progressPercent}
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
                    {children ?? <QuestionnaireIntroduction onStart={onStartTest} />}
                </div>
            </PrimaryContainer>
        </div>
    );
};

export default Questionnaire;
