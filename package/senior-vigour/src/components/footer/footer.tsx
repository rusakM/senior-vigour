import type { FC } from 'react';
import { useTranslate } from '@tolgee/react';
import { constantsUrls } from '../../helpers/constants';
import styles from './footer.module.scss';

import EuLogo from '../../assets/icons/eu.svg';
import CcIcon from '../../assets/icons/cc.svg';
import LinkedInIcon from '../../assets/icons/in.svg';
import InstagramIcon from '../../assets/icons/insta.svg';
import YoutubeIcon from '../../assets/icons/yt.svg';

export interface FooterProps {
    additionalClasses?: string;
}

const Footer: FC<FooterProps> = ({ additionalClasses }) => {
    const { t } = useTranslate();

    const handleRedirect = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const combinedClassName = [styles.footer, additionalClasses || ''].filter(Boolean).join(' ');

    return (
        <footer className={combinedClassName}>
            <div className={styles.container}>
                <div className={styles.columnsRow}>
                    <div className={styles.leftCol}>
                        <p className={styles.disclaimer}>
                            {t(
                                'footer.disclaimer',
                                'Funded by the European Union. The views and opinions expressed are those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.'
                            )}
                        </p>
                        <p className={styles.licenseText}>
                            <span>
                                {t(
                                    'footer.openLicence',
                                    'All Senior Vigour project results are available free of charge and under an open licence.'
                                )}
                            </span>
                            <img src={CcIcon} alt="CC Icon" className={styles.ccIcon} />
                        </p>
                    </div>

                    <div className={styles.rightCol}>
                        <div className={styles.euLogoWrapper}>
                            <img
                                src={EuLogo}
                                alt="Co-funded by the European Union"
                                className={styles.euLogo}
                            />
                        </div>
                        <div className={styles.socials}>
                            <img
                                src={LinkedInIcon}
                                alt="LinkedIn"
                                className={styles.socialIcon}
                                onClick={() => handleRedirect(constantsUrls.Footer.linkedIn)}
                            />
                            <img
                                src={InstagramIcon}
                                alt="Instagram"
                                className={styles.socialIcon}
                                onClick={() => handleRedirect('https://www.instagram.com/')}
                            />
                            <img
                                src={YoutubeIcon}
                                alt="YouTube"
                                className={styles.socialIcon}
                                onClick={() => handleRedirect(constantsUrls.Footer.youtube)}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <div className={styles.legalLinks}>
                        <a
                            href={constantsUrls.Footer.privacyPolicy}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.legalLink}
                        >
                            {t('footer.privacyPolicy', 'Privacy Policy')}
                        </a>
                        <a
                            href={constantsUrls.Footer.conditionTerms}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.legalLink}
                        >
                            {t('footer.termsOfUse', 'Terms of Use')}
                        </a>
                    </div>

                    <p className={styles.copyright}>
                        {t(
                            'footer.copyright',
                            '© 2025 | All Rights Reserved | Developed by Senior Vigour Project'
                        )}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
