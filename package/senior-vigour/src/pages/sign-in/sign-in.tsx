import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import TextInput from '../../components/text-input/text-input';
import { constantsUrls } from '../../helpers/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { checkEmailStart, clearUserState } from '../../redux/user/user.actions';
import {
    selectCurrentUser,
    selectIsLoadingData,
    selectLoginEmail,
    selectUserError,
} from '../../redux/user/user.selectors';
import { ERRORS_ENUM } from '../../api/user.api';

import LogIllustration from '../../assets/sign-in/log.svg';
import styles from './sign-in.module.scss';

export interface SignInProps {
    onSubmitEmail?: (email: string) => void;
}

const SignIn: FC<SignInProps> = ({ onSubmitEmail }) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(selectCurrentUser);
    const loginEmail = useAppSelector(selectLoginEmail);
    const loginError = useAppSelector(selectUserError);
    const isLoadingData = useAppSelector(selectIsLoadingData);

    const [email, setEmail] = useState('');
    const [loginStarted, setLoginStarted] = useState(false);

    // If user is already logged in, redirect to landing page
    useEffect(() => {
        if (currentUser) {
            navigate(constantsUrls.LandingPage.main);
        }
    }, [currentUser, navigate]);

    // Handle checkEmail response:
    // 200 (success) -> navigate to Confirm
    // 404 / USER_WITH_EMAIL_NOT_FOUND (error) -> navigate to SignUp
    useEffect(() => {
        if (!loginStarted || isLoadingData) return;

        if (
            loginError === ERRORS_ENUM.USER_WITH_EMAIL_NOT_FOUND ||
            loginError.includes('USER_WITH_EMAIL_NOT_FOUND') ||
            loginError.includes('not exist')
        ) {
            navigate(constantsUrls.LandingPage.signUp);
        } else if (!loginError && loginEmail) {
            navigate(constantsUrls.LandingPage.confirm);
        }
    }, [loginStarted, isLoadingData, loginError, loginEmail, navigate]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return;

        if (onSubmitEmail) {
            onSubmitEmail(trimmedEmail);
        }
        setLoginStarted(true);
        dispatch(checkEmailStart(trimmedEmail));
    };

    const handleBack = () => {
        dispatch(clearUserState());
        navigate(constantsUrls.LandingPage.main);
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
                            placeholder={t('inputs.email', 'Email')}
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
                            {t('buttons.signUp', 'Sign up')}
                        </Link>
                    </p>

                    <div className={styles.buttonRow}>
                        <PrimaryButton
                            htmlType="submit"
                            color="violet"
                            rounded
                            animated
                            disabled={isLoadingData}
                            additionalClasses={styles.loginButton}
                        >
                            {t('buttons.login', 'Log In')}
                        </PrimaryButton>

                        <PrimaryButton
                            htmlType="button"
                            color="white"
                            rounded
                            animated
                            additionalClasses={styles.backButton}
                            onClick={handleBack}
                        >
                            {t('buttons.back', 'Back')}
                        </PrimaryButton>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SignIn;
