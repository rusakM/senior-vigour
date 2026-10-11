import type { FC, FormEvent } from 'react';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';
import { getName, getCodes } from 'country-list';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import TextInput from '../../components/text-input/text-input';
import SelectInput from '../../components/select-input/select-input';
import type { ISelectInputOption } from '../../components/select-input/select-input';
import { constantsUrls } from '../../helpers/constants';
import { isUserProfileComplete } from '../../helpers/user.helper';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/user/user.selectors';

import LogIllustration from '../../assets/sign-in/log.svg';
import styles from './fill-register-data.module.scss';

export interface FillRegisterDataProps {
    onSubmitData?: (data: { firstName: string; lastName: string; country: string }) => void;
    initialFirstName?: string;
    initialLastName?: string;
    initialCountry?: string;
}

const FillRegisterData: FC<FillRegisterDataProps> = ({
    onSubmitData,
    initialFirstName,
    initialLastName,
    initialCountry,
}) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentUser = useAppSelector(selectCurrentUser);

    const [firstName, setFirstName] = useState(
        initialFirstName !== undefined ? initialFirstName : (currentUser?.firstName || '')
    );
    const [lastName, setLastName] = useState(
        initialLastName !== undefined ? initialLastName : (currentUser?.lastName || '')
    );
    const [country, setCountry] = useState(
        initialCountry !== undefined
            ? initialCountry
            : (currentUser?.countryCode || searchParams.get('selected') || '')
    );
    const [validationError, setValidationError] = useState<string | null>(null);

    const initialOpened = searchParams.get('open') === 'true';

    useEffect(() => {
        if (currentUser && isUserProfileComplete(currentUser)) {
            navigate(constantsUrls.LandingPage.main);
        }
    }, [currentUser, navigate]);

    const countriesList: ISelectInputOption[] = useMemo(() => {
        return getCodes()
            .map((code) => ({
                label: getName(code) || code,
                value: code,
            }))
            .sort((a, b) => (getName(a.value) || a.value).localeCompare(getName(b.value) || b.value));
    }, []);

    const handleFirstNameChange = (val: string) => {
        setFirstName(val);
        if (validationError) setValidationError(null);
    };

    const handleLastNameChange = (val: string) => {
        setLastName(val);
        if (validationError) setValidationError(null);
    };

    const handleCountryChange = (val: string) => {
        setCountry(val);
        if (validationError) setValidationError(null);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();
        const trimmedCountry = country.trim();

        if (!trimmedFirst || !trimmedLast || !trimmedCountry) {
            setValidationError(
                t('fillRegisterData.error.requiredFields', 'Please fill in all fields to proceed.')
            );
            return;
        }

        setValidationError(null);
        if (onSubmitData) {
            onSubmitData({ firstName: trimmedFirst, lastName: trimmedLast, country: trimmedCountry });
        }

        navigate(constantsUrls.LandingPage.selectRole, {
            state: {
                firstName: trimmedFirst,
                lastName: trimmedLast,
                countryCode: trimmedCountry,
            },
        });
    };

    const handleBack = () => {
        navigate(constantsUrls.LandingPage.main);
    };

    return (
        <div className={styles.pageWrapper}>
            <BackgroundShapes shapes={[{ id: 1, isMirrored: false }]} />
            <Header />

            <main className={styles.contentContainer}>
                <form className={styles.card} onSubmit={handleSubmit} noValidate>
                    <img
                        src={LogIllustration}
                        alt=""
                        className={styles.illustration}
                        role="presentation"
                    />

                    <h1 className={styles.title}>
                        {t('moreInfo.title', 'Tell us more about yourself!')}
                    </h1>

                    <div className={styles.namesRow}>
                        <div className={styles.nameInputWrapper}>
                            <TextInput
                                type="text"
                                placeholder={t('fillRegisterData.firstNamePlaceholder', 'First Name')}
                                value={firstName}
                                onChange={(e) => handleFirstNameChange(e.target.value)}
                                autoComplete="given-name"
                                name="firstName"
                                id="firstName"
                            />
                        </div>
                        <div className={styles.nameInputWrapper}>
                            <TextInput
                                type="text"
                                placeholder={t('fillRegisterData.lastNamePlaceholder', 'Last Name')}
                                value={lastName}
                                onChange={(e) => handleLastNameChange(e.target.value)}
                                autoComplete="family-name"
                                name="lastName"
                                id="lastName"
                            />
                        </div>
                    </div>

                    <div className={styles.selectWrapper}>
                        <SelectInput
                            options={countriesList}
                            value={country}
                            onChange={handleCountryChange}
                            placeholder={t('fillRegisterData.countryPlaceholder', 'Country')}
                            emptyText={t('common.noResults', 'No results found')}
                            initialOpened={initialOpened}
                            name="country"
                            id="country"
                        />
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

export default FillRegisterData;
