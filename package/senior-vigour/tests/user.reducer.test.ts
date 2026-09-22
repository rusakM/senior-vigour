import { describe, it, expect } from 'vitest';
import userReducer from '../src/redux/user/user.reducer';
import {
    checkEmailStart,
    checkEmailSuccess,
    checkEmailFailure,
    setCurrentUser,
    signOut,
} from '../src/redux/user/user.actions';
import type { IUser } from '../src/types/user';
import { UserRoleEnum } from '../src/types/user';

describe('userReducer', () => {
    const initialState = {
        currentUser: null,
        isFetching: false,
        signInEmail: '',
        userError: '',
    };

    it('should return initial state when passed unknown action', () => {
        const result = userReducer(undefined, { type: 'UNKNOWN_ACTION' });
        expect(result).toEqual(initialState);
    });

    it('should handle CHECK_EMAIL_START', () => {
        const action = checkEmailStart('test@example.com');
        const result = userReducer(initialState, action);

        expect(result).toEqual({
            ...initialState,
            isFetching: true,
            signInEmail: 'test@example.com',
            userError: '',
        });
    });

    it('should handle CHECK_EMAIL_SUCCESS', () => {
        const action = checkEmailSuccess('test@example.com');
        const state = { ...initialState, isFetching: true };
        const result = userReducer(state, action);

        expect(result).toEqual({
            ...initialState,
            isFetching: false,
            signInEmail: 'test@example.com',
            userError: '',
        });
    });

    it('should handle CHECK_EMAIL_FAILURE', () => {
        const action = checkEmailFailure('Invalid email');
        const state = { ...initialState, isFetching: true };
        const result = userReducer(state, action);

        expect(result).toEqual({
            ...initialState,
            isFetching: false,
            userError: 'Invalid email',
        });
    });

    it('should handle SET_CURRENT_USER', () => {
        const mockUser: IUser = {
            _id: 'user123',
            email: 'jan@example.com',
            firstName: 'Jan',
            role: UserRoleEnum.STUDENT,
        };
        const action = setCurrentUser(mockUser);
        const result = userReducer(initialState, action);

        expect(result.currentUser).toEqual(mockUser);
        expect(result.isFetching).toBe(false);
    });

    it('should handle SIGN_OUT', () => {
        const loggedInState = {
            currentUser: { _id: '123', email: 'jan@example.com' } as IUser,
            isFetching: false,
            signInEmail: 'jan@example.com',
            userError: '',
        };
        const action = signOut();
        const result = userReducer(loggedInState, action);

        expect(result).toEqual(initialState);
    });
});
