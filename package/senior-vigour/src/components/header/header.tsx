import type { FC } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslate } from '@tolgee/react';

import PrimaryButton from '../primary-button/primary-button';
import DropdownMenu, { type DropdownMenuItem } from '../dropdown-menu/dropdown-menu';
import { useMobile } from '../../helpers/responsiveContainers';
import { constantsUrls, type TLocale } from '../../helpers/constants';
import { selectCurrentUser } from '../../redux/user/user.selectors';
import { signOut } from '../../redux/user/user.actions';
import { UserRoleEnum } from '../../types/user';
import tolgeeConfig from '../../translations';

import styles from './header.module.scss';

import LogoIcon from '../../assets/icons/logo.svg';
import TranslateIcon from '../../assets/icons/translate.svg';
import HamburgerIcon from '../../assets/icons/hamburger.svg';

const LANGUAGE_LABELS: Record<TLocale, { translationKey: string; defaultLabel: string }> = {
    en: { translationKey: 'header.languages.english', defaultLabel: 'English' },
    pl: { translationKey: 'header.languages.polish', defaultLabel: 'Polski' },
    el: { translationKey: 'header.languages.greek', defaultLabel: 'Ελληνικά' },
    it: { translationKey: 'header.languages.italian', defaultLabel: 'Italiano' },
    es: { translationKey: 'header.languages.spanish', defaultLabel: 'Español' },
    lv: { translationKey: 'header.languages.latvian', defaultLabel: 'Latviešu' },
};

const Header: FC = () => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isMobile = useMobile();
    const currentUser = useSelector(selectCurrentUser);

    const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const languagesMenuRef = useRef<HTMLElement | null>(null);
    const languagesButtonRef = useRef<HTMLDivElement | null>(null);
    const mobileMenuRef = useRef<HTMLElement | null>(null);
    const mobileButtonRef = useRef<HTMLDivElement | null>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        const target = event.target as Node;

        if (
            languagesMenuRef.current &&
            !languagesMenuRef.current.contains(target) &&
            languagesButtonRef.current &&
            !languagesButtonRef.current.contains(target)
        ) {
            setIsLanguagesOpen(false);
        }

        if (
            mobileMenuRef.current &&
            !mobileMenuRef.current.contains(target) &&
            mobileButtonRef.current &&
            !mobileButtonRef.current.contains(target)
        ) {
            setIsMobileMenuOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isLanguagesOpen || isMobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLanguagesOpen, isMobileMenuOpen, handleClickOutside]);

    const languageItems: DropdownMenuItem[] = (Object.keys(LANGUAGE_LABELS) as TLocale[]).map((key) => ({
        key,
        label: t(LANGUAGE_LABELS[key].translationKey, LANGUAGE_LABELS[key].defaultLabel),
    }));

    const handleSelectLanguage = (langKey: string) => {
        tolgeeConfig.changeLanguage(langKey);
        localStorage.setItem('locale', langKey);
        setIsLanguagesOpen(false);
    };

    const handleNavigate = (path: string) => {
        navigate(path);
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(signOut());
        localStorage.removeItem('token');
        navigate(constantsUrls.LandingPage.main);
        setIsMobileMenuOpen(false);
    };

    const isEducator = currentUser?.role === UserRoleEnum.TEACHER;

    const navMenuItems: DropdownMenuItem[] = [
        { key: 'materials', label: t('header.menu.materials', 'Materials') },
        { key: 'senior', label: t('header.menu.senior', 'For Seniors') },
        ...(isEducator
            ? [
                  { key: 'educator', label: t('header.menu.educator', 'For Educators') },
                  { key: 'guide', label: t('header.menu.guide', "Teacher's Guide") },
              ]
            : []),
        { key: 'diagnostic', label: t('header.menu.diagnostic', 'Assessment Results') },
        ...(currentUser
            ? [
                  { key: 'profile', label: t('header.menu.profile', 'Profile') },
                  { key: 'logout', label: t('header.menu.logout', 'Log Out') },
              ]
            : [{ key: 'login', label: t('header.menu.login', 'Log In') }]),
    ];

    const handleMobileMenuItemSelect = (key: string) => {
        switch (key) {
            case 'materials':
                handleNavigate(constantsUrls.Main.materials);
                break;
            case 'senior':
                handleNavigate(constantsUrls.Main.seniorView);
                break;
            case 'educator':
                handleNavigate(constantsUrls.Main.educatorView);
                break;
            case 'guide':
                handleNavigate(constantsUrls.Main.didacticGuide);
                break;
            case 'diagnostic':
                handleNavigate(constantsUrls.Main.diagnosticResults);
                break;
            case 'profile':
                handleNavigate(constantsUrls.Main.myProfile);
                break;
            case 'login':
                handleNavigate(constantsUrls.LandingPage.signIn);
                break;
            case 'logout':
                handleLogout();
                break;
            default:
                break;
        }
    };

    return (
        <header className={styles.headerWrapper}>
            <div className={styles.headerContainer}>
                <div className={styles.header}>
                    <img
                        src={LogoIcon}
                        alt="Senior Vigour Logo"
                        className={styles.logo}
                        onClick={() => handleNavigate(constantsUrls.LandingPage.main)}
                    />

                    <div className={styles.controls}>
                        {!isMobile ? (
                            <>
                                <button
                                    type="button"
                                    className={styles.materialsButton}
                                    onClick={() => handleNavigate(constantsUrls.Main.materials)}
                                >
                                    {t('header.menu.materials', 'Materials')}
                                </button>

                                <div
                                    ref={languagesButtonRef}
                                    className={`${styles.control} ${isLanguagesOpen ? styles.controlActive : ''}`}
                                    onClick={() => setIsLanguagesOpen((prev) => !prev)}
                                    title={t('header.selectLanguage', 'Select language')}
                                >
                                    <img src={TranslateIcon} alt="Language" />
                                </div>

                                {currentUser ? (
                                    <PrimaryButton
                                        color="violet"
                                        rounded
                                        animated
                                        additionalClasses={styles.loginButton}
                                        onClick={() => handleNavigate(constantsUrls.Main.myProfile)}
                                    >
                                        {t('header.menu.profile', 'Profile')}
                                    </PrimaryButton>
                                ) : (
                                    <PrimaryButton
                                        color="violet"
                                        rounded
                                        animated
                                        additionalClasses={styles.loginButton}
                                        onClick={() => handleNavigate(constantsUrls.LandingPage.signIn)}
                                    >
                                        {t('header.menu.login', 'Log In')}
                                    </PrimaryButton>
                                )}
                            </>
                        ) : (
                            <div
                                ref={mobileButtonRef}
                                className={`${styles.control} ${isMobileMenuOpen ? styles.controlActive : ''}`}
                                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                                title={t('header.menuTitle', 'Menu')}
                            >
                                <img src={HamburgerIcon} alt="Menu" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <DropdownMenu
                isOpen={isLanguagesOpen}
                items={languageItems}
                onItemSelect={handleSelectLanguage}
                reference={languagesMenuRef}
            />

            {isMobile && (
                <DropdownMenu
                    isOpen={isMobileMenuOpen}
                    items={navMenuItems}
                    onItemSelect={handleMobileMenuItemSelect}
                    reference={mobileMenuRef}
                />
            )}
        </header>
    );
};

export default Header;
