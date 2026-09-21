import { takeLatest, put, all, call } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import { UserActionTypes } from './user.types';
import * as Api from '../../api/index';
import {
	checkEmailFailure,
	checkEmailSuccess,
	signUpSuccess,
	signUpFailure,
	verifyCodeSuccess,
	verifyCodeFailure,
	refreshTokenFailure,
	refreshTokenSuccess,
	signOut,
} from './user.actions';
import type { IUser, IUserLogin, IUserRegistration } from '../../types/user';

// Action Definitions for takeLatest
const checkEmailStart = createAction<string>(UserActionTypes.CHECK_EMAIL_START);
const signUpStart = createAction<IUserRegistration>(
	UserActionTypes.SIGN_UP_START,
);
const verifyCodeStart = createAction<IUserLogin>(
	UserActionTypes.VERIFY_CODE_START,
);
const refreshTokenStart = createAction(UserActionTypes.REFRESH_TOKEN_START);

function getErrorMessage(error: unknown, fallback: string): string {
	if (typeof error === 'object' && error !== null) {
		const errObj = error as { message?: string; name?: string };
		if (errObj.message) return errObj.message;
		if (errObj.name) return errObj.name;
	}
	if (typeof error === 'string') return error;
	return fallback;
}

function* checkEmail({ payload }: ReturnType<typeof checkEmailStart>) {
	try {
		yield call(
			Api.sendData,
			'/api/user/auth/check-email',
			{ email: payload },
			'POST',
		);
		yield put(checkEmailSuccess(payload));
	} catch (error: unknown) {
		yield put(checkEmailFailure(getErrorMessage(error, 'Check email error')));
	}
}

function* signUp({ payload }: ReturnType<typeof signUpStart>) {
	try {
		yield call(Api.sendData, '/api/user/auth/register', payload, 'POST');
		yield put(signUpSuccess(payload.email));
	} catch (error: unknown) {
		yield put(signUpFailure(getErrorMessage(error, 'Sign up error')));
	}
}

function* verifyCode({ payload }: ReturnType<typeof verifyCodeStart>) {
	try {
		const response: { user: IUser; token: string } = yield call(
			Api.sendData,
			'/api/user/auth/confirm',
			payload,
			'POST',
		);
		if (response?.token) {
			localStorage.setItem('token', response.token);
		}
		yield put(verifyCodeSuccess(response.user));
	} catch (error: unknown) {
		yield put(verifyCodeFailure(getErrorMessage(error, 'Verification failed')));
	}
}

function* refreshToken() {
	try {
		const response: { token: string } = yield call(
			Api.sendData,
			'/api/user/auth/refresh-token',
			{},
			'POST',
		);
		if (response?.token) {
			localStorage.setItem('token', response.token);
			yield put(refreshTokenSuccess(response.token));
		} else {
			yield put(signOut());
		}
	} catch (error: unknown) {
		yield put(refreshTokenFailure(getErrorMessage(error, 'Refresh token failed')));
	}
}

function* onCheckEmailStart() {
	yield takeLatest(checkEmailStart.type, checkEmail);
}

function* onSignUpStart() {
	yield takeLatest(signUpStart.type, signUp);
}

function* onVerifyCodeStart() {
	yield takeLatest(verifyCodeStart.type, verifyCode);
}

function* onRefreshTokenStart() {
	yield takeLatest(refreshTokenStart.type, refreshToken);
}

export function* userSagas() {
	yield all([
		call(onCheckEmailStart),
		call(onSignUpStart),
		call(onVerifyCodeStart),
		call(onRefreshTokenStart),
	]);
}
