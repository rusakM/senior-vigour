import type { FC, FormEvent } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import { constantsUrls } from '../../helpers/constants';
import { isUserProfileComplete } from '../../helpers/user.helper';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { editUserStart, userErrorClear } from '../../redux/user/user.actions';
import {
    selectCurrentUser,
    selectIsLoadingData,
    selectUserError,
} from '../../redux/user/user.selectors';
import { UserRoleEnum, type UserRole, type IUserEditPayload } from '../../types/user';

import LogIllustration from '../../assets/sign-in/log.svg';
import styles from './select-role.module.scss';

export interface SelectRoleProps {
    initialRole?: UserRole;
    initialFirstName?: string;
    initialLastName?: string;
    initialCountryCode?: string;
    initialError?: string;
    onSelectRole?: (role: UserRole) => void;
}

const SelectRole: FC<SelectRoleProps> = ({
    initialRole,
    initialFirstName,
    initialLastName,
    initialCountryCode,
    initialError,
    onSelectRole,
}) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useAppDispatch();

    const currentUser = useAppSelector(selectCurrentUser);
    const isLoadingData = useAppSelector(selectIsLoadingData);
    const userError = useAppSelector(selectUserError);

    const locationState = location.state as {
        firstName?: string;
        lastName?: string;
        countryCode?: string;
    } | null;

    const firstName = initialFirstName ?? locationState?.firstName ?? currentUser?.firstName ?? '';
    const lastName = initialLastName ?? locationState?.lastName ?? currentUser?.lastName ?? '';
    const countryCode = initialCountryCode ?? locationState?.countryCode ?? currentUser?.countryCode ?? '';

    const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRole ?? null);
    const [validationError, setValidationError] = useState<string | null>(initialError ?? null);

    useEffect(() => {
        if (currentUser && isUserProfileComplete(currentUser)) {
            navigate(constantsUrls.LandingPage.main);
        }
    }, [currentUser, navigate]);

    const errorMessage = useMemo(() => {
        if (validationError) {
            return validationError;
        }
        if (userError) {
            return userError;
        }
        return null;
    }, [validationError, userError]);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        if (validationError) setValidationError(null);
        if (userError) dispatch(userErrorClear());
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!selectedRole) {
            setValidationError(
                t('selectRole.error.requiredRole', 'Please select an option to proceed.')
            );
            return;
        }

        setValidationError(null);
        if (onSelectRole) {
            onSelectRole(selectedRole);
        }

        const payload: IUserEditPayload = {
            role: selectedRole,
            confirmed: true,
        };
        if (firstName) payload.firstName = firstName;
        if (lastName) payload.lastName = lastName;
        if (countryCode) payload.countryCode = countryCode;

        dispatch(editUserStart(payload));
    };

    const handleBack = () => {
        navigate(constantsUrls.LandingPage.main);
    };

    return (
        <div className={styles.pageWrapper}>
            <BackgroundShapes />
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

                    <p className={styles.question}>
                        {t('selectRole.question', 'Are you an educator?')}
                    </p>

                    <div
                        className={styles.optionsContainer}
                        role="radiogroup"
                        aria-label={t('selectRole.question', 'Are you an educator?')}
                    >
                        <button
                            type="button"
                            role="radio"
                            aria-checked={selectedRole === UserRoleEnum.MENTOR}
                            className={`${styles.roleOption} ${
                                selectedRole === UserRoleEnum.MENTOR ? styles.selectedOption : ''
                            }`}
                            onClick={() => handleRoleSelect(UserRoleEnum.MENTOR)}
                            disabled={isLoadingData}
                        >
                            {t('options.yes', 'YES')}
                        </button>

                        <button
                            type="button"
                            role="radio"
                            aria-checked={selectedRole === UserRoleEnum.SENIOR}
                            className={`${styles.roleOption} ${
                                selectedRole === UserRoleEnum.SENIOR ? styles.selectedOption : ''
                            }`}
                            onClick={() => handleRoleSelect(UserRoleEnum.SENIOR)}
                            disabled={isLoadingData}
                        >
                            {t('options.no', 'NO')}
                        </button>
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
                            additionalClasses={styles.confirmButton}
                        >
                            {t('buttons.confirm', 'Confirm')}
                        </PrimaryButton>

                        <PrimaryButton
                            htmlType="button"
                            color="white"
                            rounded
                            animated
                            disabled={isLoadingData}
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

export default SelectRole;
