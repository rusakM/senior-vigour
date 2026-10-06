import type { FC, FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import TextInput from '../../components/text-input/text-input';
import { constantsUrls } from '../../helpers/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
    checkEmailStart,
    clearUserState,
    userErrorClear,
    verifyCodeStart,
} from '../../redux/user/user.actions';
import {
    selectCurrentUser,
    selectIsLoadingData,
    selectLoginEmail,
    selectUserError,
} from '../../redux/user/user.selectors';

import VerificationIllustration from '../../assets/sign-in/verifcation.svg';
import styles from './confirm.module.scss';

export interface ConfirmProps {
    initialEmail?: string;
    initialError?: string | null;
    onResend?: () => void;
    onConfirm?: (code: string) => void;
}

const Confirm: FC<ConfirmProps> = ({
    initialEmail,
    initialError,
    onResend,
    onConfirm,
}) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(selectCurrentUser);
    const loginEmail = useAppSelector(selectLoginEmail);
    const loginError = useAppSelector(selectUserError);
    const isLoadingData = useAppSelector(selectIsLoadingData);

    const email = initialEmail !== undefined ? initialEmail : loginEmail;
    const [code, setCode] = useState('');

    const defaultErrorMessage = t(
        'confirm.error.invalidCode',
        'Invalid verification code or account does not exist.'
    );

    // Guard: confirm screen is only accessible if email request succeeded (email is present)
    // and currentUser does not exist yet. After successful login, redirect to landing page.
    useEffect(() => {
        if (currentUser) {
            navigate(constantsUrls.LandingPage.main);
            return;
        }
        if (!email) {
            navigate(constantsUrls.LandingPage.main);
        }
    }, [currentUser, email, navigate]);

    const errorMessage = initialError !== undefined
        ? initialError
        : (loginError ? defaultErrorMessage : null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedCode = code.trim();
        if (onConfirm) {
            onConfirm(trimmedCode);
        }
        if (email && trimmedCode) {
            dispatch(verifyCodeStart({ email, verificationCode: trimmedCode }));
        }
    };

    const handleResend = () => {
        if (loginError) {
            dispatch(userErrorClear());
        }
        if (onResend) {
            onResend();
        }
        if (email) {
            dispatch(checkEmailStart(email));
        }
    };

    const handleCodeChange = (value: string) => {
        setCode(value);
        if (loginError) {
            dispatch(userErrorClear());
        }
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
                <form className={styles.confirmCard} onSubmit={handleSubmit} noValidate>
                    <img
                        src={VerificationIllustration}
                        alt=""
                        className={styles.illustration}
                        role="presentation"
                    />

                    <h1 className={styles.title}>
                        {t('confirm.title', 'Enter Verification Code')}
                    </h1>

                    <div className={styles.description}>
                        <p>
                            {t(
                                'confirm.description.line1',
                                "We've sent a verification code to your email address."
                            )}
                        </p>
                        <p>
                            {t(
                                'confirm.description.line2',
                                'Check your email, open the message, and enter the verification code below.'
                            )}
                        </p>
                    </div>

                    <div className={styles.inputWrapper}>
                        <TextInput
                            type="text"
                            placeholder={t('confirm.codePlaceholder', 'Enter the code from your email')}
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            autoComplete="one-time-code"
                            name="code"
                            id="code"
                        />
                    </div>

                    <button
                        type="button"
                        className={`${styles.resendButton} ${!errorMessage ? styles.noErrorBelow : ''}`}
                        onClick={handleResend}
                        disabled={isLoadingData}
                    >
                        {t('confirm.resendCode', 'Resend Code')}
                    </button>

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
                            additionalClasses={styles.confirmButton}
                        >
                            {t('buttons.confirm', 'Confirm')}
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

export default Confirm;
