import { useState, type FC } from 'react';

import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';
import PageContainer from '../../page-components/page-container/page-container';
import BackgroundShapes from '../../components/background-shapes/background-shapes';

import { LEARNING_AREAS_DATA, type LessonPlanItem, type InfographicItem } from './materials.data';
import CategorySelector from './components/category-selector/category-selector';
import HandbookBanner from './components/handbook-banner/handbook-banner';
import LessonPlansSection from './components/lesson-plans-section/lesson-plans-section';
import ResourcesSection from './components/resources-section/resources-section';

import styles from './materials.module.scss';

const Materials: FC = () => {
    const [selectedAreaKey, setSelectedAreaKey] = useState<string>('mental-health');

    const currentArea =
        LEARNING_AREAS_DATA.find((a) => a.key === selectedAreaKey) || LEARNING_AREAS_DATA[0];

    const handleOpenHandbook = () => {
        // Trigger handbook opening / viewer
    };

    const handleDownload = (_item: LessonPlanItem | InfographicItem) => {
        console.log(_item);
        // Trigger material download
    };

    const handleView = (_item: LessonPlanItem) => {
        console.log(_item);
        // Trigger lesson plan view
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
                <HandbookBanner
                    currentArea={currentArea}
                    onOpenHandbook={handleOpenHandbook}
                />

                {/* 3. Lesson Plans Section */}
                <LessonPlansSection
                    currentArea={currentArea}
                    onDownload={handleDownload}
                    onView={handleView}
                />

                {/* 4. Infographics / Downloadable Resources Section */}
                <ResourcesSection
                    currentArea={currentArea}
                    onDownload={handleDownload}
                />
            </main>

            <Footer />
        </PageContainer>
    );
};

export default Materials;
