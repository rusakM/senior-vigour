import type { FC, FormEvent } from 'react';
import { useState, useMemo } from 'react';
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

import LogIllustration from '../../assets/sign-in/log.svg';
import styles from './fill-register-data.module.scss';

export interface FillRegisterDataProps {
    onSubmitData?: (data: { firstName: string; lastName: string; country: string }) => void;
}

const FillRegisterData: FC<FillRegisterDataProps> = ({ onSubmitData }) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [country, setCountry] = useState(searchParams.get('selected') || '');
    const initialOpened = searchParams.get('open') === 'true';

    const countriesList: ISelectInputOption[] = useMemo(() => {
        return getCodes()
            .map((code) => ({
                label: getName(code) || code,
                value: code,
            }))
            .sort((a, b) => (getName(a.value) || a.value).localeCompare(getName(b.value) || b.value));
    }, []);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (onSubmitData) {
            onSubmitData({ firstName, lastName, country });
        }
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
                                onChange={(e) => setFirstName(e.target.value)}
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
                                onChange={(e) => setLastName(e.target.value)}
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
                            onChange={(val) => setCountry(val)}
                            placeholder={t('fillRegisterData.countryPlaceholder', 'Country')}
                            emptyText={t('common.noResults', 'No results found')}
                            initialOpened={initialOpened}
                            name="country"
                            id="country"
                        />
                    </div>

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
                            onClick={() => navigate(constantsUrls.LandingPage.main)}
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
