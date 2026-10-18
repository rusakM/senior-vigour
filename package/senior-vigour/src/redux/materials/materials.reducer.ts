import type { UnknownAction } from '@reduxjs/toolkit';
import { type IMaterialsState, MaterialsActionTypes } from './materials.types';
import type { IMaterial } from '../../types/material';

const INITIAL_STATE: IMaterialsState = {
    materialsByCategory: {},
    selectedCategory: 'MENTAL_HEALTH',
    isFetching: false,
    error: null,
};

const materialsReducer = (
    state: IMaterialsState = INITIAL_STATE,
    action: UnknownAction
): IMaterialsState => {
    switch (action.type) {
        case MaterialsActionTypes.FETCH_MATERIALS_START:
            return {
                ...state,
                isFetching: true,
                error: null,
            };
        case MaterialsActionTypes.FETCH_MATERIALS_SUCCESS: {
            const { category, materials } = action.payload as {
                category: string;
                materials: IMaterial[];
            };
            return {
                ...state,
                isFetching: false,
                materialsByCategory: {
                    ...state.materialsByCategory,
                    [category]: materials,
                },
                error: null,
            };
        }
        case MaterialsActionTypes.FETCH_MATERIALS_FAILURE:
            return {
                ...state,
                isFetching: false,
                error: action.payload as string,
            };
        case MaterialsActionTypes.SET_SELECTED_CATEGORY:
            return {
                ...state,
                selectedCategory: action.payload as string,
            };
        case MaterialsActionTypes.CLEAR_MATERIALS_STATE:
            return INITIAL_STATE;
        default:
            return state;
    }
};

export default materialsReducer;
