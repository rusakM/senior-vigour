import type { IUser } from '../types/user';

/**
 * Checks whether user has completed all necessary profile details (first name, last name, confirmed).
 * If not, the user should be directed to fill out registration details.
 */
export const isUserProfileComplete = (user: IUser | null | undefined): boolean => {
    if (!user) return false;
    return Boolean(
        user.firstName &&
        user.firstName.trim().length > 0 &&
        user.lastName &&
        user.lastName.trim().length > 0 &&
        user.confirmed
    );
};
