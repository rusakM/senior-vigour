import { type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';
import { useMobile } from '../../helpers/responsiveContainers';
import { constantsUrls } from '../../helpers/constants';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import desktopIllustration from '../../assets/404/404_desktop.svg';
import mobileIllustration from '../../assets/404/404_mobile.svg';
import styles from './not-found.module.scss';

const NotFound: FC = () => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const isMobile = useMobile();

    const handleBackHome = () => {
        navigate(constantsUrls.LandingPage.main);
    };

    return (
        <div className={styles.notFoundContainer} data-testid="not-found-page">
            <BackgroundShapes count={1} />
            <div className={styles.illustrationWrapper} aria-hidden="true">
                <img
                    src={isMobile ? mobileIllustration : desktopIllustration}
                    alt=""
                    className={styles.illustration}
                    data-testid="not-found-illustration"
                />
            </div>
            <div className={styles.content}>
                <span className={styles.errorCode} data-testid="not-found-code">
                    404
                </span>
                <h1 className={styles.title} data-testid="not-found-title">
                    {t('notFound.title', 'Nie znaleźliśmy tej strony')}
                </h1>
                <p
                    className={styles.description}
                    data-testid="not-found-description"
                >
                    {t(
                        'notFound.description',
                        'Strona mogła zostać przeniesiona lub adres jest nieaktualny.'
                    )}
                </p>
                <button
                    type="button"
                    className={styles.homeButton}
                    onClick={handleBackHome}
                    data-testid="not-found-home-button"
                >
                    {t('notFound.backToHome', 'Wróć na stronę główną')}
                </button>
            </div>
        </div>
    );
};

export default NotFound;
