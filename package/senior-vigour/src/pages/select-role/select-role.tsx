import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import BackgroundShapes from '../../components/background-shapes/background-shapes';
import PrimaryButton from '../../components/primary-button/primary-button';
import { constantsUrls } from '../../helpers/constants';
import { UserRoleEnum, type UserRole } from '../../types/user';

import LogIllustration from '../../assets/sign-in/log.svg';
import styles from './select-role.module.scss';

export interface SelectRoleProps {
    initialRole?: UserRole;
    onSelectRole?: (role: UserRole) => void;
}

const SelectRole: FC<SelectRoleProps> = ({ initialRole, onSelectRole }) => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRole ?? null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (onSelectRole && selectedRole) {
            onSelectRole(selectedRole);
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
                        {t('selectRole.title', 'Tell us more about yourself!')}
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
                            onClick={() => setSelectedRole(UserRoleEnum.MENTOR)}
                        >
                            {t('selectRole.options.yes', 'YES')}
                        </button>

                        <button
                            type="button"
                            role="radio"
                            aria-checked={selectedRole === UserRoleEnum.SENIOR}
                            className={`${styles.roleOption} ${
                                selectedRole === UserRoleEnum.SENIOR ? styles.selectedOption : ''
                            }`}
                            onClick={() => setSelectedRole(UserRoleEnum.SENIOR)}
                        >
                            {t('selectRole.options.no', 'NO')}
                        </button>
                    </div>

                    <div className={styles.buttonRow}>
                        <PrimaryButton
                            htmlType="submit"
                            color="violet"
                            rounded
                            animated
                            additionalClasses={styles.confirmButton}
                        >
                            {t('selectRole.buttons.confirm', 'Confirm')}
                        </PrimaryButton>

                        <PrimaryButton
                            htmlType="button"
                            color="white"
                            rounded
                            animated
                            additionalClasses={styles.backButton}
                            onClick={() => navigate(constantsUrls.LandingPage.main)}
                        >
                            {t('selectRole.buttons.back', 'Back')}
                        </PrimaryButton>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default SelectRole;
