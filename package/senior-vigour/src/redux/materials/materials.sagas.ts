import { takeLatest, put, all, call } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { MaterialsActionTypes } from './materials.types';
import * as Api from '../../api/index';
import { fetchMaterialsSuccess, fetchMaterialsFailure } from './materials.actions';
import type { IMaterial } from '../../types/material';
import { constantsUrls } from '../../helpers/constants';

const fetchMaterialsStart = createAction<string>(
    MaterialsActionTypes.FETCH_MATERIALS_START
);

function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
        const errObj = error as { name?: string; message?: string; error?: string };
        if (errObj.error) return errObj.error;
        if (errObj.message) return errObj.message;
        if (errObj.name) return errObj.name;
    }
    if (typeof error === 'string') return error;
    return fallback;
}

export function* fetchMaterials({ payload }: ReturnType<typeof fetchMaterialsStart>) {
    try {
        const response: IMaterial[] = yield call(
            Api.getData,
            `${constantsUrls.Materials.getByCategory}/${payload}`
        );
        yield put(fetchMaterialsSuccess(payload, response || []));
    } catch (error: unknown) {
        yield put(
            fetchMaterialsFailure(getErrorMessage(error, 'Failed to fetch materials'))
        );
    }
}

function* onFetchMaterialsStart() {
    yield takeLatest(fetchMaterialsStart.type, fetchMaterials);
}

export function* materialsSagas() {
    yield all([call(onFetchMaterialsStart)]);
}
