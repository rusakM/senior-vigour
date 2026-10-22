import { useState, useEffect, lazy, Suspense, type FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';

import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import PageContainer from '../../page-components/page-container/page-container';
import BackgroundShapes from '../../components/background-shapes/background-shapes';

const Flipbook = lazy(() => import('../../components/flipbook/flipbook'));

import { LEARNING_AREAS_DATA } from './materials.data';
import CategorySelector from './components/category-selector/category-selector';
import HandbookBanner from './components/handbook-banner/handbook-banner';
import LessonPlansSection from './components/lesson-plans-section/lesson-plans-section';
import ResourcesSection from './components/resources-section/resources-section';

import { selectCurrentUser } from '../../redux/user/user.selectors';
import {
    selectHandbook,
    selectLessonPlans,
    selectInfographics,
} from '../../redux/materials/materials.selectors';
import {
    fetchMaterialsStart,
    setSelectedCategory,
} from '../../redux/materials/materials.actions';

import { UserRoleEnum } from '../../types/user';
import type { IMaterial } from '../../types/material';
import { downloadFile, getMaterialUrl } from '../../helpers/materials.functions';
import { getCurrentLocale } from '../../translations/utils';

import styles from './materials.module.scss';

const CATEGORY_MAP: Record<string, string> = {
    'mental-health': 'MENTAL_HEALTH',
    'physical-health': 'PHYSICAL_HEALTH',
    nutrition: 'NUTRITION',
    'social-interactions': 'SOCIAL_INTERACTIONS',
    ecology: 'ECOLOGY',
    'digital-technologies': 'DIGITAL_TECHNOLOGIES',
};

const REVERSE_CATEGORY_MAP: Record<string, string> = {
    MENTAL_HEALTH: 'mental-health',
    PHYSICAL_HEALTH: 'physical-health',
    NUTRITION: 'nutrition',
    SOCIAL_INTERACTIONS: 'social-interactions',
    ECOLOGY: 'ecology',
    DIGITAL_TECHNOLOGIES: 'digital-technologies',
};

const resolveInitialAreaKey = (
    locationState: unknown,
    searchParams: URLSearchParams
): string => {
    const stateObj = locationState as {
        categoryKey?: string;
        category?: string;
    } | null;

    if (stateObj?.categoryKey && CATEGORY_MAP[stateObj.categoryKey]) {
        return stateObj.categoryKey;
    }
    if (stateObj?.category) {
        if (CATEGORY_MAP[stateObj.category]) return stateObj.category;
        if (REVERSE_CATEGORY_MAP[stateObj.category]) {
            return REVERSE_CATEGORY_MAP[stateObj.category];
        }
    }

    const queryCat =
        searchParams.get('category') || searchParams.get('categoryKey');
    if (queryCat) {
        if (CATEGORY_MAP[queryCat]) return queryCat;
        if (REVERSE_CATEGORY_MAP[queryCat]) return REVERSE_CATEGORY_MAP[queryCat];
    }

    return 'mental-health';
};

const Materials: FC = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const currentUser = useSelector(selectCurrentUser);
    const isMentor = currentUser?.role === UserRoleEnum.MENTOR;

    const handbook = useSelector(selectHandbook);
    const lessonPlans = useSelector(selectLessonPlans);
    const infographics = useSelector(selectInfographics);

    const [selectedAreaKey, setSelectedAreaKey] = useState<string>(() =>
        resolveInitialAreaKey(location.state, searchParams)
    );
    const [activeMaterial, setActiveMaterial] = useState<IMaterial | null>(null);

    const currentArea =
        LEARNING_AREAS_DATA.find((a) => a.key === selectedAreaKey) || LEARNING_AREAS_DATA[0];

    useEffect(() => {
        const backendCategory = CATEGORY_MAP[selectedAreaKey] || 'MENTAL_HEALTH';
        dispatch(setSelectedCategory(backendCategory));
        dispatch(fetchMaterialsStart(backendCategory));
    }, [selectedAreaKey, dispatch]);

    const handleOpenHandbook = () => {
        if (handbook) {
            setActiveMaterial(handbook);
        }
    };

    const handleDownload = (material: IMaterial) => {
        const lang = getCurrentLocale();
        downloadFile(getMaterialUrl(material, lang));
    };

    const handleView = (material: IMaterial) => {
        setActiveMaterial(material);
    };

    return (
        <PageContainer additionalClasses={styles.pageWrapper}>
            <BackgroundShapes />
            <Header />

            <main className={styles.materialsMain} data-testid="materials-page">
                {/* 1. Category Selector */}
                <CategorySelector
                    selectedAreaKey={selectedAreaKey}
                    onSelectArea={setSelectedAreaKey}
                    currentArea={currentArea}
                />

                {/* 2. Handbook Banner */}
                {isMentor && (
                    <HandbookBanner
                        currentArea={currentArea}
                        handbook={handbook}
                        onOpenHandbook={handleOpenHandbook}
                    />
                )}

                {/* 3. Lesson Plans Section */}
                {isMentor && (
                    <LessonPlansSection
                        currentArea={currentArea}
                        lessonPlans={lessonPlans}
                        onDownload={handleDownload}
                        onView={handleView}
                    />
                )}

                {/* 4. Infographics / Downloadable Resources Section */}
                <ResourcesSection
                    currentArea={currentArea}
                    infographics={infographics}
                    onDownload={handleDownload}
                />
            </main>

            {activeMaterial && (
                <Suspense fallback={null}>
                    <Flipbook
                        material={activeMaterial}
                        onClose={() => setActiveMaterial(null)}
                    />
                </Suspense>
            )}

            <Footer />
        </PageContainer>
    );
};

export default Materials;
