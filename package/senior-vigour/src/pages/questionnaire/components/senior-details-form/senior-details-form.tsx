import type { FC, SubmitEvent } from 'react';
import { useState } from 'react';
import { useTranslate } from '@tolgee/react';

import Header from '../../../../components/header/header';
import BackgroundShapes from '../../../../components/background-shapes/background-shapes';
import PrimaryButton from '../../../../components/primary-button/primary-button';
import TextInput from '../../../../components/text-input/text-input';

import SeniorsDetailsIllustration from '../../../../assets/questionnaire/seniors_ditails.svg';
import styles from './senior-details-form.module.scss';

export interface ISeniorDetails {
    firstName: string;
    lastName: string;
}

export interface SeniorDetailsFormProps {
    initialFirstName?: string;
    initialLastName?: string;
    onSubmit: (details: ISeniorDetails) => void;
    onBack: () => void;
}

const SeniorDetailsForm: FC<SeniorDetailsFormProps> = ({
    initialFirstName = '',
    initialLastName = '',
    onSubmit,
    onBack,
}) => {
    const { t } = useTranslate();
    const [firstName, setFirstName] = useState(initialFirstName);
    const [lastName, setLastName] = useState(initialLastName);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleFirstNameChange = (value: string) => {
        setFirstName(value);
        if (validationError) {
            setValidationError(null);
        }
    };

    const handleLastNameChange = (value: string) => {
        setLastName(value);
        if (validationError) {
            setValidationError(null);
        }
    };

    const handleFormSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();

        if (!trimmedFirst || !trimmedLast) {
            setValidationError(
                t(
                    'questionnaire.seniorDetails.error.requiredFields',
                    'Please fill in all fields to proceed.'
                )
            );
            return;
        }

        setValidationError(null);
        onSubmit({
            firstName: trimmedFirst,
            lastName: trimmedLast,
        });
    };

    return (
        <div className={styles.pageWrapper} data-testid="senior-details-form-page">
            <BackgroundShapes />
            <Header />

            <div className={styles.contentContainer}>
                <form className={styles.card} onSubmit={handleFormSubmit} noValidate>
                    <img
                        src={SeniorsDetailsIllustration}
                        alt=""
                        className={styles.illustration}
                        role="presentation"
                    />

                    <h1 className={styles.title}>
                        {t('questionnaire.seniorDetails.title', "Enter the senior's details")}
                    </h1>

                    <div className={styles.namesRow}>
                        <div className={styles.nameInputWrapper}>
                            <TextInput
                                type="text"
                                placeholder={t(
                                    'questionnaire.seniorDetails.firstNamePlaceholder',
                                    'Name'
                                )}
                                value={firstName}
                                onChange={(e) => handleFirstNameChange(e.target.value)}
                                autoComplete="given-name"
                                name="seniorFirstName"
                                id="seniorFirstName"
                            />
                        </div>
                        <div className={styles.nameInputWrapper}>
                            <TextInput
                                type="text"
                                placeholder={t(
                                    'questionnaire.seniorDetails.lastNamePlaceholder',
                                    'Last name'
                                )}
                                value={lastName}
                                onChange={(e) => handleLastNameChange(e.target.value)}
                                autoComplete="family-name"
                                name="seniorLastName"
                                id="seniorLastName"
                            />
                        </div>
                    </div>

                    {validationError && (
                        <p className={styles.errorMessage} role="alert">
                            {validationError}
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
                            {t('buttons.confirm', 'Confirm')}
                        </PrimaryButton>

                        <PrimaryButton
                            htmlType="button"
                            color="white"
                            rounded
                            animated
                            additionalClasses={styles.backButton}
                            onClick={onBack}
                        >
                            {t('buttons.back', 'Back')}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SeniorDetailsForm;
