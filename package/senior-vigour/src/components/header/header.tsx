import type { FC } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import AvatarIcon from '../../assets/icons/avatar.svg';

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
    const location = useLocation();
    const dispatch = useDispatch();
    const isMobile = useMobile();
    const currentUser = useSelector(selectCurrentUser);

    const isMaterialsActive = location.pathname === constantsUrls.Main.materials;
    const isEducatorsGuideActive =
        location.pathname === constantsUrls.Main.educatorsGuide ||
        location.pathname === constantsUrls.Main.didacticGuide;

    const [isLanguagesOpen, setIsLanguagesOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const languagesMenuRef = useRef<HTMLElement | null>(null);
    const languagesButtonRef = useRef<HTMLDivElement | null>(null);
    const mobileMenuRef = useRef<HTMLElement | null>(null);
    const mobileButtonRef = useRef<HTMLDivElement | null>(null);
    const userMenuRef = useRef<HTMLElement | null>(null);
    const userButtonRef = useRef<HTMLButtonElement | null>(null);

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

        if (
            userMenuRef.current &&
            !userMenuRef.current.contains(target) &&
            userButtonRef.current &&
            !userButtonRef.current.contains(target)
        ) {
            setIsUserMenuOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isLanguagesOpen || isMobileMenuOpen || isUserMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLanguagesOpen, isMobileMenuOpen, isUserMenuOpen, handleClickOutside]);

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
        setIsUserMenuOpen(false);
    };

    const handleLogout = () => {
        dispatch(signOut());
        localStorage.removeItem('token');
        navigate(constantsUrls.LandingPage.main);
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    };

    const isEducator = currentUser?.role === UserRoleEnum.MENTOR;

    const navMenuItems: DropdownMenuItem[] = currentUser
        ? [
              { key: 'materials', label: t('header.menu.materials', 'Materials') },
              ...(isEducator
                  ? [{ key: 'guide', label: t('header.menu.educatorsGuide', "Educators guide") }]
                  : []),
              { key: 'selfAssessment', label: t('header.menu.selfAssessment', 'Self assessment') },
              { key: 'diagnostic', label: t('header.menu.diagnostic', 'Assessment results') },
              { key: 'profile', label: t('header.menu.profile', 'User profile') },
              { key: 'logout', label: t('header.menu.logout', 'Log out') },
          ]
        : [
              { key: 'materials', label: t('header.menu.materials', 'Materials') },
              { key: 'login', label: t('header.menu.login', 'Log In') },
          ];

    const userMenuItems: DropdownMenuItem[] = [
        { key: 'profile', label: t('header.menu.profile', 'User profile') },
        { key: 'logout', label: t('header.menu.logout', 'Log out') },
    ];

    const handleMobileMenuItemSelect = (key: string) => {
        switch (key) {
            case 'materials':
                handleNavigate(constantsUrls.Main.materials);
                break;
            case 'guide':
                handleNavigate(constantsUrls.Main.educatorsGuide);
                break;
            case 'selfAssessment':
                handleNavigate(constantsUrls.Main.diagnosticTest);
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

    const handleUserMenuItemSelect = (key: string) => {
        if (key === 'profile') {
            handleNavigate(constantsUrls.Main.myProfile);
        } else if (key === 'logout') {
            handleLogout();
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
                        {isMobile ? (
                            <>
                                <div
                                    ref={languagesButtonRef}
                                    className={`${styles.control} ${isLanguagesOpen ? styles.controlActive : ''}`}
                                    onClick={() => {
                                        setIsLanguagesOpen((prev) => !prev);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    title={t('header.selectLanguage', 'Select language')}
                                >
                                    <img src={TranslateIcon} alt="Language" />
                                </div>

                                <div
                                    ref={mobileButtonRef}
                                    className={`${styles.control} ${isMobileMenuOpen ? styles.controlActive : ''}`}
                                    onClick={() => {
                                        setIsMobileMenuOpen((prev) => !prev);
                                        setIsLanguagesOpen(false);
                                    }}
                                    title={t('header.menuTitle', 'Menu')}
                                >
                                    <img src={HamburgerIcon} alt="Menu" />
                                </div>
                            </>
                        ) : (
                            <>
                                {currentUser ? (
                                    <>
                                        {isEducator && (
                                            <PrimaryButton
                                                color="transparent"
                                                additionalClasses={styles.educatorBadge}
                                            >
                                                {t('header.badge.educator', 'Educator')}
                                            </PrimaryButton>
                                        )}

                                        <button
                                            type="button"
                                            className={`${styles.materialsButton}${isMaterialsActive ? ` ${styles.materialsButtonActive}` : ''}`}
                                            onClick={() => handleNavigate(constantsUrls.Main.materials)}
                                        >
                                            {t('header.menu.materials', 'Materials')}
                                        </button>

                                        {isEducator && (
                                            <button
                                                type="button"
                                                className={`${styles.materialsButton}${isEducatorsGuideActive ? ` ${styles.materialsButtonActive}` : ''}`}
                                                onClick={() => handleNavigate(constantsUrls.Main.educatorsGuide)}
                                            >
                                                {t('header.menu.educatorsGuide', "Educators guide")}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className={styles.materialsButton}
                                            onClick={() => handleNavigate(constantsUrls.Main.diagnosticTest)}
                                        >
                                            {t('header.menu.selfAssessment', 'Self assessment')}
                                        </button>

                                        <button
                                            type="button"
                                            className={styles.materialsButton}
                                            onClick={() => handleNavigate(constantsUrls.Main.diagnosticResults)}
                                        >
                                            {t('header.menu.diagnostic', 'Assessment results')}
                                        </button>

                                        <div
                                            ref={languagesButtonRef}
                                            className={`${styles.control} ${isLanguagesOpen ? styles.controlActive : ''}`}
                                            onClick={() => {
                                                setIsLanguagesOpen((prev) => !prev);
                                                setIsUserMenuOpen(false);
                                            }}
                                            title={t('header.selectLanguage', 'Select language')}
                                        >
                                            <img src={TranslateIcon} alt="Language" />
                                        </div>

                                        <button
                                            ref={userButtonRef}
                                            type="button"
                                            className={`${styles.materialsButton} ${styles.userButton}`}
                                            onClick={() => {
                                                setIsUserMenuOpen((prev) => !prev);
                                                setIsLanguagesOpen(false);
                                            }}
                                        >
                                            <img src={AvatarIcon} alt="User" className={styles.userIcon} />
                                            <span>
                                                {currentUser.firstName || t('header.menu.profile', 'User profile')}
                                            </span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className={`${styles.materialsButton}${isMaterialsActive ? ` ${styles.materialsButtonActive}` : ''}`}
                                            onClick={() => handleNavigate(constantsUrls.Main.materials)}
                                        >
                                            {t('header.menu.materials', 'Materials')}
                                        </button>

                                        <div
                                            ref={languagesButtonRef}
                                            className={`${styles.control} ${isLanguagesOpen ? styles.controlActive : ''}`}
                                            onClick={() => {
                                                setIsLanguagesOpen((prev) => !prev);
                                                setIsUserMenuOpen(false);
                                            }}
                                            title={t('header.selectLanguage', 'Select language')}
                                        >
                                            <img src={TranslateIcon} alt="Language" />
                                        </div>

                                        <button
                                            type="button"
                                            className={`${styles.materialsButton} ${styles.userButton}`}
                                            onClick={() => handleNavigate(constantsUrls.LandingPage.signIn)}
                                        >
                                            <img src={AvatarIcon} alt="User" className={styles.userIcon} />
                                            <span>{t('header.menu.login', 'Log In')}</span>
                                        </button>
                                    </>
                                )}
                            </>
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

            {!isMobile && currentUser && (
                <DropdownMenu
                    isOpen={isUserMenuOpen}
                    items={userMenuItems}
                    onItemSelect={handleUserMenuItemSelect}
                    reference={userMenuRef}
                />
            )}
        </header>
    );
};

export default Header;
