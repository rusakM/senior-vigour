import type { IMaterial } from '../../types/material';

export const MaterialsActionTypes = {
    FETCH_MATERIALS_START: 'FETCH_MATERIALS_START',
    FETCH_MATERIALS_SUCCESS: 'FETCH_MATERIALS_SUCCESS',
    FETCH_MATERIALS_FAILURE: 'FETCH_MATERIALS_FAILURE',
    SET_SELECTED_CATEGORY: 'SET_SELECTED_CATEGORY',
    CLEAR_MATERIALS_STATE: 'CLEAR_MATERIALS_STATE',
} as const;

export interface IMaterialsState {
    materialsByCategory: Record<string, IMaterial[]>;
    selectedCategory: string;
    isFetching: boolean;
    error: string | null;
}
