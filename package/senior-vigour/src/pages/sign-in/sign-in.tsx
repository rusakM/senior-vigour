import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import TextInput from '../../components/text-input/text-input';
import { constantsUrls } from '../../helpers/constants';

import LogIllustration from '../../assets/sign-in/log.svg';
import styles from './sign-in.module.scss';

const SignIn: FC = () => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
    };

    return (
        <div className={styles.pageWrapper}>
            <BackgroundShapes shapes={[{ id: 1, isMirrored: false }]} />
            <Header />

            <main className={styles.contentContainer}>
                <form className={styles.signInCard} onSubmit={handleSubmit} noValidate>
                    <img
                        src={LogIllustration}
                        alt=""
                        className={styles.illustration}
                        role="presentation"
                    />

                    <h1 className={styles.title}>
                        {t('signIn.title', 'Sign In')}
                    </h1>

                    <div className={styles.inputWrapper}>
                        <TextInput
                            type="email"
                            placeholder={t('signIn.emailPlaceholder', 'Email')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            name="email"
                            id="email"
                        />
                    </div>

                    <p className={styles.signUpPrompt}>
                        <span>{t('signIn.noAccount', "Don't have an account?")} </span>
                        <Link
                            to={constantsUrls.LandingPage.signUp}
                            className={styles.signUpLink}
                        >
                            {t('signIn.signUpLink', 'Sign up')}
                        </Link>
                    </p>

                    <div className={styles.buttonRow}>
                        <PrimaryButton
                            htmlType="submit"
                            color="violet"
                            rounded
                            animated
                            additionalClasses={styles.loginButton}
                        >
                            {t('signIn.buttons.login', 'Log In')}
                        </PrimaryButton>

                        <PrimaryButton
                            htmlType="button"
                            color="white"
                            rounded
                            animated
                            additionalClasses={styles.backButton}
                            onClick={() => navigate(constantsUrls.LandingPage.main)}
                        >
                            {t('signIn.buttons.back', 'Back')}
                        </PrimaryButton>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SignIn;
