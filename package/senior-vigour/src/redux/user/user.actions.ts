import { UserActionTypes } from './user.types';
import type { IUser, IUserLogin, IUserRegistration } from '../../types/user';

export const checkEmailStart = (email: string) => ({
	type: UserActionTypes.CHECK_EMAIL_START,
	payload: email,
});

export const checkEmailSuccess = (email: string) => ({
	type: UserActionTypes.CHECK_EMAIL_SUCCESS,
	payload: email,
});

export const checkEmailFailure = (error: string) => ({
	type: UserActionTypes.CHECK_EMAIL_FAILURE,
	payload: error,
});

export const signUpStart = (userData: IUserRegistration) => ({
	type: UserActionTypes.SIGN_UP_START,
	payload: userData,
});

export const signUpSuccess = (email: string) => ({
	type: UserActionTypes.SIGN_UP_SUCCESS,
	payload: email,
});

export const signUpFailure = (error: string) => ({
	type: UserActionTypes.SIGN_UP_FAILURE,
	payload: error,
});

export const verifyCodeStart = (payload: IUserLogin) => ({
	type: UserActionTypes.VERIFY_CODE_START,
	payload,
});

export const verifyCodeSuccess = (currentUser: IUser) => ({
	type: UserActionTypes.VERIFY_CODE_SUCCESS,
	payload: currentUser,
});

export const verifyCodeFailure = (error: string) => ({
	type: UserActionTypes.VERIFY_CODE_FAILURE,
	payload: error,
});

export const refreshTokenStart = () => ({
	type: UserActionTypes.REFRESH_TOKEN_START,
});

export const refreshTokenSuccess = (token: string) => ({
	type: UserActionTypes.REFRESH_TOKEN_SUCCESS,
	payload: token,
});

export const refreshTokenFailure = (error: string) => ({
	type: UserActionTypes.REFRESH_TOKEN_FAILURE,
	payload: error,
});

export const setCurrentUser = (user: IUser | null) => ({
	type: UserActionTypes.SET_CURRENT_USER,
	payload: user,
});

export const signOut = () => ({
	type: UserActionTypes.SIGN_OUT,
});

export const userErrorClear = () => ({
	type: UserActionTypes.USER_ERROR_CLEAR,
});

export const clearUserState = () => ({
	type: UserActionTypes.CLEAR_USER_STATE,
});
