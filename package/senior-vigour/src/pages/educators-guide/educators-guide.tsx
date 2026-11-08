import { useEffect, useState, lazy, Suspense, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import PageContainer from '../../page-components/page-container/page-container';
import BackgroundShapes from '../../components/background-shapes/background-shapes';

import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { UserRoleEnum } from '../../types/user';
import { MaterialTypeEnum, type IMaterial } from '../../types/material';
import { constantsUrls } from '../../helpers/constants';
import { downloadFile, getMaterialUrl } from '../../helpers/materials.functions';
import { getCurrentLocale } from '../../translations/utils';

import FileIcon from '../../assets/icons/file_icon.svg';
import BrownArrow from '../../assets/icons/brown_arrow.svg';

import styles from './educators-guide.module.scss';

const Flipbook = lazy(() => import('../../components/flipbook/flipbook'));

// eslint-disable-next-line react-refresh/only-export-components
export const EDUCATORS_GUIDE_MATERIAL: IMaterial = {
    name: 'Educators_Guide',
    category: 'MENTAL_HEALTH',
    type: MaterialTypeEnum.EDUCATORS_GUIDE,
    translation: 'educatorsGuide.title',
    languages: {
        el: { name: 'Educators_Guide', fileExtension: 'pdf', pages: 8 },
        en: { name: 'Educators_Guide', fileExtension: 'pdf', pages: 8 },
        es: { name: 'Educators_Guide', fileExtension: 'pdf', pages: 8 },
        it: { name: 'Educators_Guide', fileExtension: 'pdf', pages: 8 },
        lv: { name: 'Educators_Guide', fileExtension: 'pdf', pages: 8 },
        pl: { name: 'Educators_Guide', fileExtension: 'pdf', pages: 8 },
    },
};

export interface EducatorsGuideProps {
    onViewFile?: () => void;
    onDownloadDocument?: () => void;
}

const EducatorsGuide: FC<EducatorsGuideProps> = ({ onViewFile, onDownloadDocument }) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const currentUser = useAppSelector(selectCurrentUser);

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
        setIsPreviewOpen(true);
    };

    const handleDownloadDocument = () => {
        if (onDownloadDocument) {
            onDownloadDocument();
        }
        const lang = getCurrentLocale();
        downloadFile(getMaterialUrl(EDUCATORS_GUIDE_MATERIAL, lang));
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
                    <div
                        className={styles.fileCard}
                        data-testid="educators-guide-card"
                        onClick={handleViewFile}
                    >
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
            {isPreviewOpen && (
                <Suspense fallback={null}>
                    <Flipbook
                        material={EDUCATORS_GUIDE_MATERIAL}
                        onClose={() => setIsPreviewOpen(false)}
                    />
                </Suspense>
            )}
            <Footer />
        </PageContainer>
    );
};

export default EducatorsGuide;
