import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';

import SummaryDesktopIcon from '../../../../assets/senor details and results/summary.svg';
import SummaryMobileIcon from '../../../../assets/senor details and results/summary_mobile.svg';

import styles from './diagnostic-banner.module.scss';

const DiagnosticBanner: FC = () => {
    const { t } = useTranslate();

    return (
        <section className={styles.bannerContainer} data-testid="diagnostic-banner">
            <div className={styles.illustrationWrapper}>
                <img
                    src={SummaryMobileIcon}
                    alt=""
                    aria-hidden="true"
                    className={styles.mobileIllustration}
                />
                <img
                    src={SummaryDesktopIcon}
                    alt=""
                    aria-hidden="true"
                    className={styles.desktopIllustration}
                />
            </div>

            <div className={styles.textWrapper}>
                <h1 className={styles.title}>
                    {t('diagnosticResults.banner.title', 'Summary')}
                </h1>
                <p className={styles.subtitle}>
                    {t(
                        'diagnosticResults.banner.subtitle',
                        'Recommendations sorted by areas requiring the most attention.'
                    )}
                </p>
            </div>
        </section>
    );
};

export default DiagnosticBanner;
