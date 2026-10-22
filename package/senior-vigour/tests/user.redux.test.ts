import { describe, it, expect, beforeEach } from 'vitest';
import { call, put } from 'redux-saga/effects';
import userReducer from '../src/redux/user/user.reducer';
import {
    disableUserStart,
    disableUserSuccess,
    disableUserFailure,
    signOut,
} from '../src/redux/user/user.actions';
import { UserActionTypes } from '../src/redux/user/user.types';
import { disableUser } from '../src/redux/user/user.sagas';
import * as Api from '../src/api/index';
import { constantsUrls } from '../src/helpers/constants';
import { UserRoleEnum, type IUser } from '../src/types/user';

describe('User Disable / Delete Account Redux & Saga', () => {
    const initialState = {
        currentUser: null,
        isFetching: false,
        signInEmail: '',
        userError: '',
    };

    const loggedInState = {
        currentUser: {
            _id: 'user-1',
            email: 'senior@example.com',
            firstName: 'Jan',
            lastName: 'Kowalski',
            role: UserRoleEnum.SENIOR,
            isEnabled: true,
        } as IUser,
        isFetching: false,
        signInEmail: '',
        userError: '',
    };

    beforeEach(() => {
        localStorage.clear();
    });

    it('creates disableUserStart, disableUserSuccess, and disableUserFailure actions', () => {
        expect(disableUserStart()).toEqual({
            type: UserActionTypes.DISABLE_USER_START,
        });
        expect(disableUserSuccess()).toEqual({
            type: UserActionTypes.DISABLE_USER_SUCCESS,
        });
        expect(disableUserFailure('Error disabling')).toEqual({
            type: UserActionTypes.DISABLE_USER_FAILURE,
            payload: 'Error disabling',
        });
    });

    it('handles DISABLE_USER_START, DISABLE_USER_SUCCESS, and DISABLE_USER_FAILURE in userReducer', () => {
        const startingState = userReducer(loggedInState, disableUserStart());
        expect(startingState.isFetching).toBe(true);
        expect(startingState.userError).toBe('');

        const successState = userReducer(startingState, disableUserSuccess());
        expect(successState).toEqual(initialState);

        const failedState = userReducer(
            startingState,
            disableUserFailure('Failed to disable account')
        );
        expect(failedState.isFetching).toBe(false);
        expect(failedState.userError).toBe('Failed to disable account');
    });

    it('disableUser saga sends PATCH { isEnabled: false }, removes token, and dispatches disableUserSuccess + signOut', () => {
        localStorage.setItem('token', 'jwt-token');
        const gen = disableUser();

        expect(gen.next().value).toEqual(
            call(
                Api.sendData,
                constantsUrls.User.edit,
                { isEnabled: false },
                'PATCH'
            )
        );
        expect(gen.next().value).toEqual(put(disableUserSuccess()));
        expect(localStorage.getItem('token')).toBeNull();
        expect(gen.next().value).toEqual(put(signOut()));
        expect(gen.next().done).toBe(true);
    });

    it('disableUser saga dispatches disableUserFailure on API error', () => {
        const gen = disableUser();

        expect(gen.next().value).toEqual(
            call(
                Api.sendData,
                constantsUrls.User.edit,
                { isEnabled: false },
                'PATCH'
            )
        );
        expect(gen.throw({ message: 'Server error' }).value).toEqual(
            put(disableUserFailure('Server error'))
        );
        expect(gen.next().done).toBe(true);
    });
});
