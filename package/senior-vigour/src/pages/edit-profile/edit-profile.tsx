import { type FC, useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';
import { getName, getCodes } from 'country-list';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import TextInput from '../../components/text-input/text-input';
import SelectInput, {
    type ISelectInputOption,
} from '../../components/select-input/select-input';
import ToggleSwitch from '../../components/toggle-switch/toggle-switch';

import { constantsUrls } from '../../helpers/constants';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { disableUserStart, editUserStart } from '../../redux/user/user.actions';

import DesktopProfileIllustration from '../../assets/profil/profil.svg';
import MobileProfileIllustration from '../../assets/profil/profil_moblie.svg';

import styles from './edit-profile.module.scss';

const EditProfile: FC = () => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);

    const isDeletingRef = useRef(false);

    const [firstName, setFirstName] = useState(currentUser?.firstName || '');
    const [lastName, setLastName] = useState(currentUser?.lastName || '');
    const [countryCode, setCountryCode] = useState(currentUser?.countryCode || '');
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser && !isDeletingRef.current) {
            navigate(constantsUrls.LandingPage.signIn, { replace: true });
        }
    }, [currentUser, navigate]);

    const countriesList: ISelectInputOption[] = useMemo(() => {
        return getCodes()
            .map((code) => ({
                label: getName(code) || code,
                value: code,
            }))
            .sort((a, b) =>
                (getName(a.value) || a.value).localeCompare(
                    getName(b.value) || b.value
                )
            );
    }, []);

    if (!currentUser) {
        return null;
    }

    const handleToggleEdit = () => {
        setIsProfileEditing((prev) => {
            const next = !prev;
            if (!next) {
                setFirstName(currentUser.firstName || '');
                setLastName(currentUser.lastName || '');
                setCountryCode(currentUser.countryCode || '');
                setValidationError(null);
            }
            return next;
        });
    };

    const handleFirstNameChange = (value: string) => {
        setFirstName(value);
        if (validationError) setValidationError(null);
    };

    const handleLastNameChange = (value: string) => {
        setLastName(value);
        if (validationError) setValidationError(null);
    };

    const handleCountryChange = (value: string) => {
        setCountryCode(value);
        if (validationError) setValidationError(null);
    };

    const handleSave = () => {
        const trimmedFirst = firstName.trim();
        const trimmedLast = lastName.trim();
        const trimmedCountry = countryCode.trim();

        if (!trimmedFirst || !trimmedLast || !trimmedCountry) {
            setValidationError(
                t(
                    'profile.error.requiredFields',
                    'Please fill in all fields to proceed.'
                )
            );
            return;
        }

        setValidationError(null);
        dispatch(
            editUserStart({
                firstName: trimmedFirst,
                lastName: trimmedLast,
                countryCode: trimmedCountry,
            })
        );
        setIsProfileEditing(false);
    };

    const handleConfirmDelete = () => {
        isDeletingRef.current = true;
        setIsDeleteModalOpen(false);
        dispatch(disableUserStart());
        localStorage.removeItem('token');
        navigate(constantsUrls.LandingPage.main);
    };

    return (
        <div className={styles.pageWrapper} data-testid="edit-profile-page">
            <BackgroundShapes />
            <div className={styles.blueBackground} aria-hidden="true" />
            <Header />

            <main className={styles.contentContainer}>
                <div className={styles.illustrationColumn}>
                    <img
                        src={MobileProfileIllustration}
                        alt=""
                        role="presentation"
                        className={styles.mobileIllustration}
                    />
                    <img
                        src={DesktopProfileIllustration}
                        alt=""
                        role="presentation"
                        className={styles.desktopIllustration}
                    />
                </div>

                <div className={styles.formColumn}>
                    <h1 className={styles.title}>
                        {t('profile.title', 'Your Profile')}
                    </h1>

                    <div className={styles.profileForm}>
                        <div className={styles.namesRow}>
                            <div className={styles.fieldGroup}>
                                <label htmlFor="firstName" className={styles.label}>
                                    {t('profile.firstName', 'First Name')}
                                </label>
                                <TextInput
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) =>
                                        handleFirstNameChange(e.target.value)
                                    }
                                    placeholder={t('profile.firstName', 'First Name')}
                                    disabled={!isProfileEditing}
                                />
                            </div>

                            <div className={styles.fieldGroup}>
                                <label htmlFor="lastName" className={styles.label}>
                                    {t('profile.lastName', 'Last Name')}
                                </label>
                                <TextInput
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) =>
                                        handleLastNameChange(e.target.value)
                                    }
                                    placeholder={t('profile.lastName', 'Last Name')}
                                    disabled={!isProfileEditing}
                                />
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="email" className={styles.label}>
                                {t('profile.email', 'Email')}
                            </label>
                            <TextInput
                                id="email"
                                name="email"
                                type="email"
                                value={currentUser.email || ''}
                                placeholder={t('profile.email', 'Email')}
                                disabled={true}
                            />
                        </div>

                        <div className={styles.fieldGroup}>
                            <label htmlFor="countryCode" className={styles.label}>
                                {t('profile.country', 'Country')}
                            </label>
                            <SelectInput
                                id="countryCode"
                                name="countryCode"
                                options={countriesList}
                                value={countryCode}
                                onChange={handleCountryChange}
                                placeholder={t('profile.country', 'Country')}
                                emptyText={t('common.noResults', 'No results found')}
                                disabled={!isProfileEditing}
                            />
                        </div>

                        {validationError && (
                            <p className={styles.errorMessage} role="alert">
                                {validationError}
                            </p>
                        )}

                        <div className={styles.actionsRow}>
                            <ToggleSwitch
                                value={isProfileEditing}
                                onToggle={handleToggleEdit}
                                label={t('profile.editProfile', 'Edit Profile')}
                            />

                            {isProfileEditing && (
                                <PrimaryButton
                                    htmlType="button"
                                    color="violet"
                                    rounded
                                    additionalClasses={styles.changeButton}
                                    onClick={handleSave}
                                    data-testid="profile-change-button"
                                >
                                    {t('profile.changeButton', 'Change')}
                                </PrimaryButton>
                            )}
                        </div>
                    </div>

                    <div className={styles.deleteSection}>
                        <button
                            type="button"
                            className={styles.deleteAccountButton}
                            onClick={() => setIsDeleteModalOpen(true)}
                            data-testid="delete-account-button"
                        >
                            {t('profile.deleteAccount', 'DELETE ACCOUNT')}
                        </button>
                    </div>
                </div>
            </main>

            {isDeleteModalOpen && (
                <div
                    className={styles.modalOverlay}
                    data-testid="delete-account-modal"
                >
                    <div className={styles.modalCard} role="dialog" aria-modal="true">
                        <h2 className={styles.modalTitle}>
                            {t('profile.deleteModal.title', 'Delete my data')}
                        </h2>
                        <p className={styles.modalDescription}>
                            {t(
                                'profile.deleteModal.description',
                                'Deleting your data permanently and irreversibly deletes your account, all user data, and all accumulated progress. Once this operation is complete, it will not be possible to recover the deleted information.'
                            )}
                        </p>
                        <div className={styles.modalButtons}>
                            <PrimaryButton
                                htmlType="button"
                                color="violet"
                                rounded
                                additionalClasses={styles.modalConfirmButton}
                                onClick={handleConfirmDelete}
                                data-testid="confirm-delete-account-button"
                            >
                                {t('buttons.confirm', 'Confirm')}
                            </PrimaryButton>
                            <PrimaryButton
                                htmlType="button"
                                color="white"
                                rounded
                                additionalClasses={styles.modalBackButton}
                                onClick={() => setIsDeleteModalOpen(false)}
                                data-testid="cancel-delete-account-button"
                            >
                                {t('buttons.back', 'Back')}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditProfile;
