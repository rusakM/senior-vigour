import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslate } from '@tolgee/react';

import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import PageContainer from '../../page-components/page-container/page-container';
import PrimaryButton from '../../components/primary-button/primary-button';
import AreaCard from '../../components/area-card/area-card';
import FlowStepCard from '../../components/flow-step-card/flow-step-card';
import PartnersGrid, { type PartnerItem } from '../../components/partners-grid/partners-grid';
import BackgroundShapes from '../../components/background-shapes/background-shapes';

import { useDeviceType } from '../../helpers/responsiveContainers';
import { constantsUrls } from '../../helpers/constants';
import { selectCurrentUser } from '../../redux/user/user.selectors';

import styles from './landing-page.module.scss';

// Assets
import HeroSvg from '../../assets/landing-page/hero.svg';
import MentalHealthSvg from '../../assets/landing-page/L_mental_health.svg';
import PhysicalHealthSvg from '../../assets/landing-page/L_physical_health.svg';
import NutritionSvg from '../../assets/landing-page/L_nutrition.svg';
import SocialInteractionsSvg from '../../assets/landing-page/L_social_interactions.svg';
import EcologySvg from '../../assets/landing-page/L_ecology.svg';
import DigitalTechnologiesSvg from '../../assets/landing-page/L_digital_technologies.svg';

import Step1Svg from '../../assets/landing-page/w_1.svg';
import Step2Svg from '../../assets/landing-page/w_2.svg';
import Step3Svg from '../../assets/landing-page/w_3.svg';
import Step4Svg from '../../assets/landing-page/w_4.svg';
import Step5Svg from '../../assets/landing-page/w_5.svg';

import BlogDesktopSvg from '../../assets/landing-page/blog.svg';
import BlogMobileSvg from '../../assets/landing-page/blog_mobile.svg';

import ProjectNetLogo from '../../assets/partners/project-net.png';
import NovareckonLogo from '../../assets/partners/novareckon.png';
import EuroliderLogo from '../../assets/partners/eurolider.png';
import AcufadeLogo from '../../assets/partners/acufade.png';
import InnovedLogo from '../../assets/partners/innoved.png';
import LovilaLogo from '../../assets/partners/lovila.png';

const partnerLogos: PartnerItem[] = [
    { name: 'Project Net', logoSrc: ProjectNetLogo, url: constantsUrls.Partners.projectNet },
    { name: 'Novareckon', logoSrc: NovareckonLogo, url: constantsUrls.Partners.novareckon },
    { name: 'Euro Lider', logoSrc: EuroliderLogo, url: constantsUrls.Partners.euroLider },
    { name: 'Acufade', logoSrc: AcufadeLogo, url: constantsUrls.Partners.acufade },
    { name: 'InnovED', logoSrc: InnovedLogo, url: constantsUrls.Partners.innoved },
    { name: 'Lovila', logoSrc: LovilaLogo, url: constantsUrls.Partners.lovila },
];

const LandingPage: FC = () => {
    const { t } = useTranslate();
    const navigate = useNavigate();
    const { isMobile } = useDeviceType();
    const currentUser = useSelector(selectCurrentUser);

    const learningAreas = [
        {
            key: 'mental-health',
            title: t('landingPage.areas.mentalHealth.title', 'Mental health'),
            description: t(
                'landingPage.areas.mentalHealth.desc',
                'Focuses on building stress resilience, understanding emotions, and developing strategies to maintain psychological well-being in everyday life.'
            ),
            icon: MentalHealthSvg,
        },
        {
            key: 'physical-health',
            title: t('landingPage.areas.physicalHealth.title', 'Physical health'),
            description: t(
                'landingPage.areas.physicalHealth.desc',
                'Covers the importance of regular exercise, preventive care, and lifestyle habits that support overall physical and cognitive fitness.'
            ),
            icon: PhysicalHealthSvg,
        },
        {
            key: 'nutrition',
            title: t('landingPage.areas.nutrition.title', 'Nutrition'),
            description: t(
                'landingPage.areas.nutrition.desc',
                'Explains the fundamentals of a balanced diet, healthy eating habits, and how nutrition impacts energy, health, and long-term well-being.'
            ),
            icon: NutritionSvg,
        },
        {
            key: 'social-interactions',
            title: t('landingPage.areas.socialInteractions.title', 'Social interactions'),
            description: t(
                'landingPage.areas.socialInteractions.desc',
                'Develops skills in communication, empathy, and relationship-building to improve social well-being and meaningful connections with others.'
            ),
            icon: SocialInteractionsSvg,
        },
        {
            key: 'ecology',
            title: t('landingPage.areas.ecology.title', 'Ecology'),
            description: t(
                'landingPage.areas.ecology.desc',
                'Introduces the concept of individual environmental impact and promotes practical habits and solutions for more sustainable living.'
            ),
            icon: EcologySvg,
        },
        {
            key: 'digital-technologies',
            title: t('landingPage.areas.digitalTechnologies.title', 'Digital technologies'),
            description: t(
                'landingPage.areas.digitalTechnologies.desc',
                'Explores the use of digital tools and the internet, including benefits, risks, and the role of emerging technologies like Artificial Intelligence in everyday life.'
            ),
            icon: DigitalTechnologiesSvg,
        },
    ];

    const flowSteps = [
        {
            stepNumber: 1,
            description: t(
                'landingPage.flow.step1.desc',
                'Register and create your account.'
            ),
            imageSrc: Step1Svg,
        },
        {
            stepNumber: 2,
            description: t(
                'landingPage.flow.step2.desc',
                'Complete the self-assessment questionnaire to identify areas where you can further develop your skills and knowledge.'
            ),
            imageSrc: Step2Svg,
        },
        {
            stepNumber: 3,
            description: t(
                'landingPage.flow.step3.desc',
                'Use the learning modules to expand your knowledge in selected topics.'
            ),
            imageSrc: Step3Svg,
        },
        {
            stepNumber: 4,
            description: t(
                'landingPage.flow.step4.desc',
                'Complete exercises and practical activities available in each learning module. The modules may include quizzes, reflection exercises, scenario-based tasks, and other activities designed to reinforce learning outcomes.'
            ),
            imageSrc: Step4Svg,
        },
        {
            stepNumber: 5,
            description: t(
                'landingPage.flow.step5.desc',
                'Complete the final assessment, which summarizes your progress and provides an overview of the knowledge and skills gained in each learning area.'
            ),
            imageSrc: Step5Svg,
        },
    ];

    return (
        <PageContainer additionalClasses={styles.pageWrapper}>
            <BackgroundShapes />
            <div className={`${styles.heroTopWrapper}${currentUser ? ` ${styles.heroTopWrapperNoHero}` : ''}`}>
                <Header />

                {/* Hero Section */}
                {!currentUser && (
                    <section className={styles.heroSection}>
                        <div className={styles.heroImageContainer}>
                            <img
                                src={HeroSvg}
                                alt="Senior Vigour Platform"
                                className={styles.heroImage}
                            />
                        </div>

                        <div className={styles.heroContent}>
                            <h1 className={styles.heroTitle}>
                                {t(
                                    'landingPage.hero.title',
                                    "Platform supporting seniors' mental well-being"
                                )}
                            </h1>
                            <p className={styles.heroSubTitle}>
                                {t(
                                    'landingPage.hero.subtitle',
                                    'Learn how to take care of your mental well-being and improve your quality of life.'
                                )}
                            </p>

                            {isMobile ? (
                                <div className={styles.heroButtonsMobile}>
                                    <PrimaryButton
                                        color="violet"
                                        rounded
                                        animated
                                        onClick={() => navigate(constantsUrls.LandingPage.signIn)}
                                    >
                                        {t('header.menu.login', 'Log In')}
                                    </PrimaryButton>
                                    <PrimaryButton
                                        color="violet"
                                        rounded
                                        animated
                                        onClick={() => navigate(constantsUrls.LandingPage.signUp)}
                                    >
                                        {t('landingPage.hero.register', 'Sign Up')}
                                    </PrimaryButton>
                                </div>
                            ) : (
                                <div className={styles.heroButtonsDesktop}>
                                    <PrimaryButton
                                        color="violet"
                                        rounded
                                        animated
                                        increaseHorizontalPadding
                                        size="large"
                                        onClick={() => navigate(constantsUrls.Main.diagnosticTest)}
                                    >
                                        {t('landingPage.hero.button', 'Start self-assessment')}
                                    </PrimaryButton>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            <div className={styles.landingPage}>
                {/* 6 Obszarów nauki */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            {t('landingPage.areas.header', 'Explore Learning Areas')}
                        </h2>
                        <p className={styles.sectionSubTitle}>
                            {t(
                                'landingPage.areas.subheader',
                                'Build practical knowledge to support your well-being and daily life.'
                            )}
                        </p>
                    </div>

                    <div className={styles.areasGridContainer}>
                        <div className={styles.areasGrid}>
                            {learningAreas.map((area) => (
                                <AreaCard
                                    key={area.key}
                                    title={area.title}
                                    description={area.description}
                                    iconSrc={area.icon}
                                    actionText={t('landingPage.areas.moreBtn', 'More')}
                                    onMoreClick={() => navigate(constantsUrls.Main.materials)}
                                />
                            ))}
                        </div>
                        {!isMobile && (
                            <>
                                <div className={styles.gridDotLeft} aria-hidden="true" />
                                <div className={styles.gridDotRight} aria-hidden="true" />
                            </>
                        )}
                    </div>
                </section>

                {/* Jak to działa? / Flow platformy */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            {t('landingPage.flow.header', 'How does it work?')}
                        </h2>
                        <p className={styles.sectionSubTitle}>
                            {t('landingPage.flow.subheader', 'A quick and easy process to get started')}
                        </p>
                    </div>

                    <div className={styles.flowList}>
                        {flowSteps.map((step) => (
                            <FlowStepCard
                                key={step.stepNumber}
                                stepNumber={step.stepNumber}
                                description={step.description}
                                imageSrc={step.imageSrc}
                            />
                        ))}
                    </div>
                </section>

                {/* Blog Section */}
                <section className={styles.blogSection}>
                    <h2 className={styles.blogTitle}>
                        {t(
                            'landingPage.blog.title',
                            'Check out our blog and learn more about our initiative!'
                        )}
                    </h2>
                    <img
                        src={isMobile ? BlogMobileSvg : BlogDesktopSvg}
                        alt="Blog Senior Vigour"
                        className={styles.blogImage}
                    />
                    <div className={styles.blogButtonWrapper}>
                        <PrimaryButton
                            color="violet"
                            rounded
                            animated
                            size="large"
                            increaseHorizontalPadding
                            additionalClasses={styles.blogButton}
                            onClick={() => window.open(constantsUrls.LandingPage.blog, '_blank')}
                        >
                            {t('landingPage.blog.button', 'Go to blog')}
                        </PrimaryButton>
                    </div>
                </section>

                {/* Partnerzy projektu */}
                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>
                            {t('landingPage.partners.header', 'Project Partners')}
                        </h2>
                    </div>

                    <PartnersGrid partners={partnerLogos} />
                </section>
            </div>

            <Footer />
        </PageContainer>
    );
};

export default LandingPage;
