import { useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import PageContainer from '../../page-components/page-container/page-container';
import BackgroundShapes from '../../components/background-shapes/background-shapes';

import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { UserRoleEnum } from '../../types/user';
import { constantsUrls } from '../../helpers/constants';

import FileIcon from '../../assets/icons/file_icon.svg';
import BrownArrow from '../../assets/icons/brown_arrow.svg';

import styles from './educators-guide.module.scss';

export interface EducatorsGuideProps {
    onViewFile?: () => void;
    onDownloadDocument?: () => void;
}

const EducatorsGuide: FC<EducatorsGuideProps> = ({ onViewFile, onDownloadDocument }) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const currentUser = useAppSelector(selectCurrentUser);

    const isMentor = currentUser?.role === UserRoleEnum.MENTOR;

    useEffect(() => {
        if (!currentUser) {
            navigate(constantsUrls.LandingPage.signIn, { replace: true });
        } else if (!isMentor) {
            navigate(constantsUrls.Main.materials, { replace: true });
        }
    }, [currentUser, isMentor, navigate]);

    if (!currentUser || !isMentor) {
        return null;
    }

    const bulletItems = [
        t('educatorsGuide.bullet1', 'Practical guidance for working with seniors'),
        t('educatorsGuide.bullet2', 'Geragogy, communication and essential soft skills'),
        t('educatorsGuide.bullet3', '12 good practices for educators and caregivers'),
    ];

    const handleViewFile = () => {
        if (onViewFile) {
            onViewFile();
        }
    };

    const handleDownloadDocument = () => {
        if (onDownloadDocument) {
            onDownloadDocument();
        }
    };

    return (
        <PageContainer additionalClasses={styles.pageWrapper}>
            <BackgroundShapes />
            <Header />

            <main className={styles.guideMain} data-testid="educators-guide-page">
                <section className={styles.leftColumn} aria-labelledby="educators-guide-title">
                    <h1 id="educators-guide-title" className={styles.title}>
                        {t('educatorsGuide.title', 'Educator’s Guide for Working with Seniors')}
                    </h1>

                    <ul className={styles.bulletList} aria-label="Key features">
                        {bulletItems.map((item, index) => (
                            <li key={index} className={styles.bulletItem}>
                                <span className={styles.bulletDot} aria-hidden="true" />
                                <span className={styles.bulletText}>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <aside className={styles.rightColumn} aria-label="Educator's Guide document card">
                    <div className={styles.fileCard} data-testid="educators-guide-card">
                        <img
                            src={FileIcon}
                            alt="Document"
                            className={styles.fileIcon}
                        />
                    </div>

                    <div className={styles.cardActions}>
                        <button
                            type="button"
                            className={styles.viewButton}
                            onClick={handleViewFile}
                            data-testid="educators-guide-view"
                        >
                            {t('educatorsGuide.viewFile', 'View File')}
                        </button>

                        <button
                            type="button"
                            className={styles.downloadButton}
                            onClick={handleDownloadDocument}
                            data-testid="educators-guide-download"
                        >
                            <span>
                                {t('educatorsGuide.downloadDocument', 'Download Document')}
                            </span>
                            <img
                                src={BrownArrow}
                                alt=""
                                aria-hidden="true"
                                className={styles.arrowIcon}
                            />
                        </button>
                    </div>
                </aside>
            </main>
        </PageContainer>
    );
};

export default EducatorsGuide;
