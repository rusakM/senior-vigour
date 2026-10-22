import { describe, it, expect, vi } from 'vitest';
import { call, put } from 'redux-saga/effects';
import * as actions from '../src/redux/materials/materials.actions';
import materialsReducer from '../src/redux/materials/materials.reducer';
import { MaterialsActionTypes, type IMaterialsState } from '../src/redux/materials/materials.types';
import * as selectors from '../src/redux/materials/materials.selectors';
import type { RootState } from '../src/redux/store.types';
import type { IMaterial } from '../src/types/material';
import { materialsSagas, fetchMaterials } from '../src/redux/materials/materials.sagas';
import * as Api from '../src/api/index';

const mockHandbook: IMaterial = {
    name: 'Handbook_PDF',
    category: 'MENTAL_HEALTH',
    type: 'HANDBOOK',
    translation: 'materials.handbook.mentalHealth',
    languages: {
        en: { name: 'Handbook_PDF', fileExtension: 'pdf', pages: 69 },
    },
};

const mockLessonPlan: IMaterial = {
    name: 'LP_MentalHealth_1',
    category: 'MENTAL_HEALTH',
    type: 'LESSON_PLAN',
    translation: 'materials.lessonPlan.1',
    languages: {
        en: { name: 'LP_MentalHealth_1', fileExtension: 'pdf', pages: 1 },
    },
};

const mockInfographic: IMaterial = {
    name: 'INFO_MentalHealth_1',
    category: 'MENTAL_HEALTH',
    type: 'INFOGRAPHIC',
    translation: 'materials.infographic.1',
    languages: {
        en: { name: 'INFO_MentalHealth_1', fileExtension: 'pdf', pages: 1 },
    },
};

describe('Materials Redux Module', () => {
    describe('Actions', () => {
        it('creates fetchMaterialsStart action', () => {
            const action = actions.fetchMaterialsStart('MENTAL_HEALTH');
            expect(action).toEqual({
                type: MaterialsActionTypes.FETCH_MATERIALS_START,
                payload: 'MENTAL_HEALTH',
            });
        });

        it('creates fetchMaterialsSuccess action', () => {
            const action = actions.fetchMaterialsSuccess('MENTAL_HEALTH', [mockHandbook]);
            expect(action).toEqual({
                type: MaterialsActionTypes.FETCH_MATERIALS_SUCCESS,
                payload: { category: 'MENTAL_HEALTH', materials: [mockHandbook] },
            });
        });

        it('creates fetchMaterialsFailure action', () => {
            const action = actions.fetchMaterialsFailure('Network Error');
            expect(action).toEqual({
                type: MaterialsActionTypes.FETCH_MATERIALS_FAILURE,
                payload: 'Network Error',
            });
        });

        it('creates setSelectedCategory action', () => {
            const action = actions.setSelectedCategory('PHYSICAL_HEALTH');
            expect(action).toEqual({
                type: MaterialsActionTypes.SET_SELECTED_CATEGORY,
                payload: 'PHYSICAL_HEALTH',
            });
        });

        it('creates clearMaterialsState action', () => {
            const action = actions.clearMaterialsState();
            expect(action).toEqual({
                type: MaterialsActionTypes.CLEAR_MATERIALS_STATE,
            });
        });
    });

    describe('Reducer', () => {
        const initialState: IMaterialsState = {
            materialsByCategory: {},
            selectedCategory: 'MENTAL_HEALTH',
            isFetching: false,
            error: null,
        };

        it('returns initial state by default', () => {
            expect(materialsReducer(undefined, { type: 'UNKNOWN' })).toEqual(initialState);
        });

        it('handles FETCH_MATERIALS_START', () => {
            const state = materialsReducer(initialState, actions.fetchMaterialsStart('MENTAL_HEALTH'));
            expect(state.isFetching).toBe(true);
            expect(state.error).toBeNull();
        });

        it('handles FETCH_MATERIALS_SUCCESS', () => {
            const loadingState = { ...initialState, isFetching: true, error: 'Previous error' };
            const state = materialsReducer(
                loadingState,
                actions.fetchMaterialsSuccess('MENTAL_HEALTH', [mockHandbook, mockLessonPlan])
            );
            expect(state.isFetching).toBe(false);
            expect(state.error).toBeNull();
            expect(state.materialsByCategory['MENTAL_HEALTH']).toEqual([mockHandbook, mockLessonPlan]);
        });

        it('handles FETCH_MATERIALS_FAILURE', () => {
            const loadingState = { ...initialState, isFetching: true };
            const state = materialsReducer(loadingState, actions.fetchMaterialsFailure('Failed to fetch'));
            expect(state.isFetching).toBe(false);
            expect(state.error).toBe('Failed to fetch');
        });

        it('handles SET_SELECTED_CATEGORY', () => {
            const state = materialsReducer(initialState, actions.setSelectedCategory('ECOLOGY'));
            expect(state.selectedCategory).toBe('ECOLOGY');
        });

        it('handles CLEAR_MATERIALS_STATE', () => {
            const modifiedState: IMaterialsState = {
                materialsByCategory: { MENTAL_HEALTH: [mockHandbook] },
                selectedCategory: 'ECOLOGY',
                isFetching: false,
                error: 'some error',
            };
            const state = materialsReducer(modifiedState, actions.clearMaterialsState());
            expect(state).toEqual(initialState);
        });
    });

    describe('Selectors', () => {
        const mockState: RootState = {
            user: { currentUser: null, isFetching: false, signInEmail: '', userError: '' },
            materials: {
                materialsByCategory: {
                    MENTAL_HEALTH: [mockHandbook, mockLessonPlan, mockInfographic],
                    PHYSICAL_HEALTH: [],
                },
                selectedCategory: 'MENTAL_HEALTH',
                isFetching: false,
                error: null,
            },
            poll: {
                questions: [],
                currentQuestionIndex: 0,
                activePoll: null,
                seniorDetails: null,
                isFetchingQuestions: false,
                isFetchingPlayerPoll: false,
                isStartingPoll: false,
                isSubmittingAnswer: false,
                error: null,
            },
        };

        it('selects selected category', () => {
            expect(selectors.selectSelectedCategory(mockState)).toBe('MENTAL_HEALTH');
        });

        it('selects isFetching status', () => {
            expect(selectors.selectIsFetchingMaterials(mockState)).toBe(false);
        });

        it('selects error', () => {
            expect(selectors.selectMaterialsError(mockState)).toBeNull();
        });

        it('selects current category materials', () => {
            expect(selectors.selectCurrentCategoryMaterials(mockState)).toEqual([
                mockHandbook,
                mockLessonPlan,
                mockInfographic,
            ]);
        });

        it('selects handbook from current category', () => {
            expect(selectors.selectHandbook(mockState)).toEqual(mockHandbook);
        });

        it('selects null handbook if not present', () => {
            const stateWithoutHandbook: RootState = {
                ...mockState,
                materials: {
                    ...mockState.materials,
                    selectedCategory: 'PHYSICAL_HEALTH',
                },
            };
            expect(selectors.selectHandbook(stateWithoutHandbook)).toBeNull();
        });

        it('selects lesson plans from current category', () => {
            expect(selectors.selectLessonPlans(mockState)).toEqual([mockLessonPlan]);
        });

        it('selects infographics from current category', () => {
            expect(selectors.selectInfographics(mockState)).toEqual([mockInfographic]);
        });
    });

    describe('Sagas', () => {
        it('handles successful materials fetch', () => {
            const gen = fetchMaterials({
                payload: 'MENTAL_HEALTH',
                type: MaterialsActionTypes.FETCH_MATERIALS_START,
            });
            expect(gen.next().value).toEqual(
                call(Api.getData, '/api/materials/MENTAL_HEALTH')
            );
            expect(gen.next([mockHandbook]).value).toEqual(
                put(actions.fetchMaterialsSuccess('MENTAL_HEALTH', [mockHandbook]))
            );
            expect(gen.next().done).toBe(true);
        });

        it('handles failed materials fetch', () => {
            const gen = fetchMaterials({
                payload: 'MENTAL_HEALTH',
                type: MaterialsActionTypes.FETCH_MATERIALS_START,
            });
            expect(gen.next().value).toEqual(
                call(Api.getData, '/api/materials/MENTAL_HEALTH')
            );
            expect(gen.throw({ message: 'Request failed' }).value).toEqual(
                put(actions.fetchMaterialsFailure('Request failed'))
            );
            expect(gen.next().done).toBe(true);
        });
    });
});
