import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import TextInput from '../../components/text-input/text-input';
import { constantsUrls } from '../../helpers/constants';

import VerificationIllustration from '../../assets/sign-in/verifcation.svg';
import styles from './confirm.module.scss';

export interface ConfirmProps {
    initialError?: string | null;
    onResend?: () => void;
    onConfirm?: (code: string) => void;
}

const Confirm: FC<ConfirmProps> = ({
    initialError,
    onResend,
    onConfirm,
}) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const [code, setCode] = useState('');

    const defaultError = t(
        'confirm.error.invalidCode',
        'Invalid verification code or account does not exist.'
    );

    const [errorMessage, setErrorMessage] = useState<string | null>(
        initialError !== undefined ? initialError : defaultError
    );

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (onConfirm) {
            onConfirm(code);
        }
    };

    const handleResend = () => {
        setErrorMessage(null);
        if (onResend) {
            onResend();
        }
    };

    const handleCodeChange = (value: string) => {
        setCode(value);
        if (errorMessage) {
            setErrorMessage(null);
        }
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
                            additionalClasses={styles.confirmButton}
                        >
                            {t('confirm.buttons.confirm', 'Confirm')}
                        </PrimaryButton>

                        <PrimaryButton
                            htmlType="button"
                            color="white"
                            rounded
                            animated
                            additionalClasses={styles.backButton}
                            onClick={() => navigate(constantsUrls.LandingPage.main)}
                        >
                            {t('confirm.buttons.back', 'Back')}
                        </PrimaryButton>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Confirm;
