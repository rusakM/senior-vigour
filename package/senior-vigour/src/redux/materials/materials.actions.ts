import { MaterialsActionTypes } from './materials.types';
import type { IMaterial } from '../../types/material';

export const fetchMaterialsStart = (category: string) => ({
    type: MaterialsActionTypes.FETCH_MATERIALS_START,
    payload: category,
});

export const fetchMaterialsSuccess = (category: string, materials: IMaterial[]) => ({
    type: MaterialsActionTypes.FETCH_MATERIALS_SUCCESS,
    payload: { category, materials },
});

export const fetchMaterialsFailure = (error: string) => ({
    type: MaterialsActionTypes.FETCH_MATERIALS_FAILURE,
    payload: error,
});

export const setSelectedCategory = (category: string) => ({
    type: MaterialsActionTypes.SET_SELECTED_CATEGORY,
    payload: category,
});

export const clearMaterialsState = () => ({
    type: MaterialsActionTypes.CLEAR_MATERIALS_STATE,
});
