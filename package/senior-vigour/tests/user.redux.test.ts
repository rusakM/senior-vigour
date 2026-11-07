import { describe, it, expect, beforeEach } from 'vitest';
import { call, put } from 'redux-saga/effects';
import userReducer from '../src/redux/user/user.reducer';
import {
    disableUserStart,
    disableUserSuccess,
    disableUserFailure,
    signOut,
    checkEmailStart,
    checkEmailSuccess,
    checkEmailFailure,
    signUpStart,
    signUpSuccess,
    signUpFailure,
} from '../src/redux/user/user.actions';
import { UserActionTypes } from '../src/redux/user/user.types';
import { disableUser, checkEmail, signUp } from '../src/redux/user/user.sagas';
import * as Api from '../src/api/index';
import { constantsUrls } from '../src/helpers/constants';
import { UserRoleEnum, type IUser, type IUserRegistration } from '../src/types/user';

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

describe('User checkEmail and signUp Sagas with userInterfaceLanguage', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('when locale is not set in localStorage (defaults to en)', () => {
        it('checkEmail saga sends email and userInterfaceLanguage: en', () => {
            const email = 'user@example.com';
            const gen = checkEmail(checkEmailStart(email));

            expect(gen.next().value).toEqual(
                call(
                    Api.sendData,
                    constantsUrls.User.checkEmail,
                    { email, userInterfaceLanguage: 'en' },
                    'POST'
                )
            );
            expect(gen.next().value).toEqual(put(checkEmailSuccess(email)));
            expect(gen.next().done).toBe(true);
        });

        it('signUp saga sends payload with userInterfaceLanguage: en', () => {
            const registrationData: IUserRegistration = { email: 'newuser@example.com' };
            const gen = signUp(signUpStart(registrationData));

            expect(gen.next().value).toEqual(
                call(
                    Api.sendData,
                    constantsUrls.User.signUp,
                    { userInterfaceLanguage: 'en', email: 'newuser@example.com' },
                    'POST'
                )
            );
            expect(gen.next().value).toEqual(put(signUpSuccess(registrationData.email)));
            expect(gen.next().done).toBe(true);
        });
    });

    describe('when user changes language in UI (locale set to pl)', () => {
        beforeEach(() => {
            localStorage.setItem('locale', 'pl');
        });

        it('checkEmail saga (login / resend code) sends email and userInterfaceLanguage: pl', () => {
            const email = 'user@example.com';
            const gen = checkEmail(checkEmailStart(email));

            expect(gen.next().value).toEqual(
                call(
                    Api.sendData,
                    constantsUrls.User.checkEmail,
                    { email, userInterfaceLanguage: 'pl' },
                    'POST'
                )
            );
            expect(gen.next().value).toEqual(put(checkEmailSuccess(email)));
            expect(gen.next().done).toBe(true);
        });

        it('signUp saga (registration) sends payload with userInterfaceLanguage: pl', () => {
            const registrationData: IUserRegistration = { email: 'newuser@example.com' };
            const gen = signUp(signUpStart(registrationData));

            expect(gen.next().value).toEqual(
                call(
                    Api.sendData,
                    constantsUrls.User.signUp,
                    { userInterfaceLanguage: 'pl', email: 'newuser@example.com' },
                    'POST'
                )
            );
            expect(gen.next().value).toEqual(put(signUpSuccess(registrationData.email)));
            expect(gen.next().done).toBe(true);
        });
    });

    describe('error handling in checkEmail and signUp sagas', () => {
        it('checkEmail saga dispatches checkEmailFailure on API error', () => {
            const gen = checkEmail(checkEmailStart('user@example.com'));
            gen.next();
            expect(gen.throw({ message: 'Email check failed' }).value).toEqual(
                put(checkEmailFailure('Email check failed'))
            );
            expect(gen.next().done).toBe(true);
        });

        it('signUp saga dispatches signUpFailure on API error', () => {
            const gen = signUp(signUpStart({ email: 'newuser@example.com' }));
            gen.next();
            expect(gen.throw({ message: 'Registration failed' }).value).toEqual(
                put(signUpFailure('Registration failed'))
            );
            expect(gen.next().done).toBe(true);
        });
    });
});
