import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import TextInput from '../../components/text-input/text-input';
import Checkbox from '../../components/checkbox/checkbox';
import { constantsUrls } from '../../helpers/constants';

import LogIllustration from '../../assets/sign-in/log.svg';
import styles from './sign-up.module.scss';

const SignUp: FC = () => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className={styles.pageWrapper}>
            <BackgroundShapes shapes={[{ id: 1, isMirrored: false }]} />
            <Header />

            <main className={styles.contentContainer}>
                <form className={styles.signUpCard} onSubmit={handleSubmit} noValidate>
                    <img
                        src={LogIllustration}
                        alt=""
                        className={styles.illustration}
                        role="presentation"
                    />

                    <h1 className={styles.title}>
                        {t('signUp.title', 'Sign Up')}
                    </h1>

                    <div className={styles.inputWrapper}>
                        <TextInput
                            type="email"
                            placeholder={t('signUp.emailPlaceholder', 'Email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            name="email"
                            id="email"
                        />
                    </div>

                    <p className={styles.signInPrompt}>
                        <span>{t('signUp.hasAccount', 'Already have an account?')} </span>
                        <Link
                            to={constantsUrls.LandingPage.signIn}
                            className={styles.signInLink}
                        >
                            {t('signUp.signInLink', 'Log in')}
                        </Link>
                    </p>

                    <div className={styles.checkboxWrapper}>
                        <Checkbox
                            id="terms"
                            name="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            label={
                                <>
                                    <span>{t('signUp.checkbox.text', 'I have read and accept the')}{' '}</span>
                                    <a
                                        href={constantsUrls.Footer.conditionTerms}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={styles.termsLink}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {t('signUp.checkbox.termsLink', 'Terms and Condition')}
                                    </a>
                                </>
                            }
                        />
                    </div>

                    <div className={styles.buttonRow}>
                        <PrimaryButton
                            htmlType="submit"
                            color="violet"
                            rounded
                            animated
                            additionalClasses={styles.signUpButton}
                        >
                            {t('signUp.buttons.signUp', 'Sign Up')}
                        </PrimaryButton>

                        <PrimaryButton
                            htmlType="button"
                            color="white"
                            rounded
                            animated
                            additionalClasses={styles.backButton}
                            onClick={() => navigate(constantsUrls.LandingPage.main)}
                        >
                            {t('signUp.buttons.back', 'Back')}
                        </PrimaryButton>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SignUp;
