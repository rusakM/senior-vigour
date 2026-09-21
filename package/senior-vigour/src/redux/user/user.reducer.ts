import type { UnknownAction } from '@reduxjs/toolkit';
import { type IUserState, UserActionTypes } from './user.types';
import type { IUser } from '../../types/user';

const INITIAL_STATE: IUserState = {
	currentUser: null,
	isFetching: false,
	signInEmail: '',
	userError: '',
};

const userReducer = (
	state: IUserState = INITIAL_STATE,
	action: UnknownAction,
): IUserState => {
	switch (action.type) {
		case UserActionTypes.CHECK_EMAIL_START:
			return {
				...state,
				isFetching: true,
				signInEmail: action.payload as string,
				userError: '',
			};
		case UserActionTypes.SIGN_UP_START:
		case UserActionTypes.VERIFY_CODE_START:
			return {
				...state,
				isFetching: true,
			};
		case UserActionTypes.CHECK_EMAIL_SUCCESS:
		case UserActionTypes.SIGN_UP_SUCCESS:
			return {
				...state,
				isFetching: false,
				signInEmail: action.payload as string,
				userError: '',
			};
		case UserActionTypes.VERIFY_CODE_SUCCESS:
		case UserActionTypes.SET_CURRENT_USER:
			return {
				...state,
				currentUser: action.payload as IUser,
				isFetching: false,
				signInEmail: '',
				userError: '',
			};
		case UserActionTypes.CHECK_EMAIL_FAILURE:
		case UserActionTypes.SIGN_UP_FAILURE:
		case UserActionTypes.VERIFY_CODE_FAILURE:
		case UserActionTypes.REFRESH_TOKEN_FAILURE:
			return {
				...state,
				isFetching: false,
				userError: action.payload as string,
			};
		case UserActionTypes.USER_ERROR_CLEAR:
			return {
				...state,
				userError: '',
				isFetching: false,
			};
		case UserActionTypes.CLEAR_USER_STATE:
		case UserActionTypes.SIGN_OUT:
			return INITIAL_STATE;
		default:
			return state;
	}
};

export default userReducer;
