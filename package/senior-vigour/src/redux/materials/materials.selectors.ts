import { createSelector } from 'reselect';
import type { RootState } from '../store.types';
import type { IMaterialsState } from './materials.types';
import type { IMaterial } from '../../types/material';

const selectMaterialsState = (state: RootState): IMaterialsState => state.materials;

export const selectSelectedCategory = createSelector(
    [selectMaterialsState],
    (materials): string => materials.selectedCategory
);

export const selectIsFetchingMaterials = createSelector(
    [selectMaterialsState],
    (materials): boolean => materials.isFetching
);

export const selectMaterialsError = createSelector(
    [selectMaterialsState],
    (materials): string | null => materials.error
);

export const selectMaterialsByCategory = createSelector(
    [selectMaterialsState],
    (materials): Record<string, IMaterial[]> => materials.materialsByCategory
);

export const selectCurrentCategoryMaterials = createSelector(
    [selectMaterialsByCategory, selectSelectedCategory],
    (materialsByCategory, category): IMaterial[] => materialsByCategory[category] || []
);

export const selectHandbook = createSelector(
    [selectCurrentCategoryMaterials],
    (materials): IMaterial | null => materials.find((m) => m.type === 'HANDBOOK') || null
);

export const selectLessonPlans = createSelector(
    [selectCurrentCategoryMaterials],
    (materials): IMaterial[] => materials.filter((m) => m.type === 'LESSON_PLAN')
);

export const selectInfographics = createSelector(
    [selectCurrentCategoryMaterials],
    (materials): IMaterial[] => materials.filter((m) => m.type === 'INFOGRAPHIC')
);
