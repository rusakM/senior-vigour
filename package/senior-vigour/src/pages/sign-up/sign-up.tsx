import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import TextInput from '../../components/text-input/text-input';
import Checkbox from '../../components/checkbox/checkbox';
import { constantsUrls } from '../../helpers/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { signUpStart, clearUserState, userErrorClear } from '../../redux/user/user.actions';
import {
    selectCurrentUser,
    selectIsLoadingData,
    selectLoginEmail,
    selectUserError,
} from '../../redux/user/user.selectors';

import LogIllustration from '../../assets/sign-in/log.svg';
import styles from './sign-up.module.scss';

export interface SignUpProps {
    initialEmail?: string;
    onSubmitEmail?: (email: string) => void;
}

const SignUp: FC<SignUpProps> = ({ initialEmail, onSubmitEmail }) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(selectCurrentUser);
    const loginEmail = useAppSelector(selectLoginEmail);
    const loginError = useAppSelector(selectUserError);
    const isLoadingData = useAppSelector(selectIsLoadingData);

    const [email, setEmail] = useState(initialEmail !== undefined ? initialEmail : (loginEmail || ''));
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [signUpStarted, setSignUpStarted] = useState(false);
    const [termsError, setTermsError] = useState(false);

    // If user is already logged in, redirect to landing page
    useEffect(() => {
        if (currentUser) {
            navigate(constantsUrls.LandingPage.main);
        }
    }, [currentUser, navigate]);

    // Handle signUp response:
    // 200 (success) -> navigate to Confirm
    useEffect(() => {
        if (!signUpStarted || isLoadingData) return;

        if (!loginError && loginEmail) {
            navigate(constantsUrls.LandingPage.confirm);
        }
    }, [signUpStarted, isLoadingData, loginError, loginEmail, navigate]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) return;

        if (!termsAccepted) {
            setTermsError(true);
            return;
        }

        setTermsError(false);
        if (onSubmitEmail) {
            onSubmitEmail(trimmedEmail);
        }
        setSignUpStarted(true);
        dispatch(signUpStart({ email: trimmedEmail }));
    };

    const handleEmailChange = (val: string) => {
        setEmail(val);
        if (loginError) {
            dispatch(userErrorClear());
        }
    };

    const handleTermsChange = (checked: boolean) => {
        setTermsAccepted(checked);
        if (checked) {
            setTermsError(false);
        }
        if (loginError) {
            dispatch(userErrorClear());
        }
    };

    const handleBack = () => {
        dispatch(clearUserState());
        navigate(constantsUrls.LandingPage.main);
    };

    const errorMessage = termsError
        ? t('signUp.error.termsRequired', 'Please accept the Terms and Conditions to proceed.')
        : (signUpStarted && loginError ? loginError : null);

    return (
        <div className={styles.pageWrapper}>
            <BackgroundShapes />
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
                            placeholder={t('inputs.email', 'Email')}
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
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
                            {t('buttons.login', 'Log in')}
                        </Link>
                    </p>

                    <div className={styles.checkboxWrapper}>
                        <Checkbox
                            id="terms"
                            name="terms"
                            checked={termsAccepted}
                            onChange={(e) => handleTermsChange(e.target.checked)}
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

                    {errorMessage && (
                        <p className={styles.errorMessage} role="alert">
                            {errorMessage}
                        </p>
                    )}

                    <div className={styles.buttonRow}>
                        <PrimaryButton
                            htmlType="submit"
                            color="violet"
                            rounded
                            animated
                            disabled={isLoadingData}
                            additionalClasses={styles.signUpButton}
                        >
                            {t('buttons.signUp', 'Sign Up')}
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

export default SignUp;
