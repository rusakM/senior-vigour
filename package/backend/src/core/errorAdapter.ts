export class ApiError extends Error implements IError {
    name: string;
    dynamicCode?: number;
    httpCode: number;
    message: string;
    type: string;
    data?: Record<string, unknown>;

    constructor(customError: IError) {
        super();
        Object.assign(this, customError);
    }
}

enum ErrorTypesEnum {
    Info,
    Warning,
    Error,
    Fatal,
}

export interface IError {
    name: string;
    httpCode: number;
    message: string;
    type: string;
}

export namespace Core {
    export enum ErrorsEnum {
        UNEXPECTED_ERROR,
        VALIDATION_ERROR,
    }

    export const Errors: { [key: string]: IError } = {
        [ErrorsEnum.UNEXPECTED_ERROR]: {
            name: ErrorsEnum[ErrorsEnum.UNEXPECTED_ERROR],
            httpCode: 500,
            message: 'Unexpected error.',
            type: ErrorTypesEnum[ErrorTypesEnum.Info],
        },
        [ErrorsEnum.VALIDATION_ERROR]: {
            name: ErrorsEnum[ErrorsEnum.VALIDATION_ERROR],
            httpCode: 404,
            message: 'Validation error.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
    };

    export function createError(errosEnum: ErrorsEnum, data?: Record<string, unknown>) {
        return new ApiError({
            ...Errors[errosEnum],
            ...(data && { data }),
        });
    }
}

export namespace Game {
    export enum ErrorsEnum {
        GAME_NOT_FOUND,
        GAME_NOT_STARTED,
        LESSON_NOT_FOUND,
        PLAYER_GAME_NOT_FOUND,
        TOO_LITTLE_PLAYERS_LIST,
    }

    export const Game: { [key: string]: IError } = {
        [ErrorsEnum.GAME_NOT_FOUND]: {
            name: ErrorsEnum[ErrorsEnum.GAME_NOT_FOUND],
            httpCode: 404,
            message: 'Game not found',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.GAME_NOT_STARTED]: {
            name: ErrorsEnum[ErrorsEnum.GAME_NOT_STARTED],
            httpCode: 422,
            message: 'Game has not been started.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.LESSON_NOT_FOUND]: {
            name: ErrorsEnum[ErrorsEnum.LESSON_NOT_FOUND],
            httpCode: 404,
            message: 'Lesson not found',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.PLAYER_GAME_NOT_FOUND]: {
            name: ErrorsEnum[ErrorsEnum.PLAYER_GAME_NOT_FOUND],
            httpCode: 404,
            message: 'Player game not found.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.TOO_LITTLE_PLAYERS_LIST]: {
            name: ErrorsEnum[ErrorsEnum.TOO_LITTLE_PLAYERS_LIST],
            httpCode: 422,
            message: 'Not enough players to start game.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
    };

    export function createError(errosEnum: ErrorsEnum, data?: Record<string, unknown>) {
        return new ApiError({
            ...Game[errosEnum],
            ...(data && { data }),
        });
    }
}

export namespace Global {
    export enum ErrorsEnum {
        ACCOUNT_TEMPORARILY_BLOCKED,
        INVALID_EMAIL_OR_PASSWORD,
        INVALID_PASSWORD,
        USER_NOT_FOUND,
        USER_WITH_EMAIL_NOT_FOUND,
        USER_EMAIL_EXIST,
        INCORRECT_VERIFICATION_CODE,
        INCORRECT_TOKEN_PAYLOAD,
        INSUFFICIENT_PERMISSIONS,
        INVALID_RECOVERY_CODE,
        INVALID_TOKEN_PAYLOAD,
        NEED_PASSWORD_RESET,
        VERIFICATION_CODE_EXPIRED,
    }

    export const Account: { [key: string]: IError } = {
        [ErrorsEnum.ACCOUNT_TEMPORARILY_BLOCKED]: {
            name: ErrorsEnum[ErrorsEnum.ACCOUNT_TEMPORARILY_BLOCKED],
            httpCode: 401,
            message: 'Account temporarily blocked.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.INVALID_EMAIL_OR_PASSWORD]: {
            name: ErrorsEnum[ErrorsEnum.INVALID_EMAIL_OR_PASSWORD],
            httpCode: 403,
            message: 'Invalid email or password.',
            type: ErrorTypesEnum[ErrorTypesEnum.Info],
        },
        [ErrorsEnum.USER_NOT_FOUND]: {
            name: ErrorsEnum[ErrorsEnum.USER_NOT_FOUND],
            httpCode: 404,
            message: 'User not found.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.USER_WITH_EMAIL_NOT_FOUND]: {
            name: ErrorsEnum[ErrorsEnum.USER_WITH_EMAIL_NOT_FOUND],
            httpCode: 404,
            message: 'User with such email does not exist.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.USER_EMAIL_EXIST]: {
            name: ErrorsEnum[ErrorsEnum.USER_EMAIL_EXIST],
            httpCode: 403,
            message: 'Email already exists.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.INCORRECT_VERIFICATION_CODE]: {
            name: ErrorsEnum[ErrorsEnum.INCORRECT_VERIFICATION_CODE],
            httpCode: 403,
            message: 'Incorrect verification code.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.INCORRECT_TOKEN_PAYLOAD]: {
            name: ErrorsEnum[ErrorsEnum.INCORRECT_TOKEN_PAYLOAD],
            httpCode: 400,
            message: 'Incorrect token payload.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.INSUFFICIENT_PERMISSIONS]: {
            name: ErrorsEnum[ErrorsEnum.INSUFFICIENT_PERMISSIONS],
            httpCode: 403,
            message: 'Insufficient permissions.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.INVALID_PASSWORD]: {
            name: ErrorsEnum[ErrorsEnum.INVALID_PASSWORD],
            httpCode: 400,
            message: 'Invalid password.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.INVALID_RECOVERY_CODE]: {
            name: ErrorsEnum[ErrorsEnum.INVALID_RECOVERY_CODE],
            httpCode: 400,
            message: 'Invalid recovery code.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.INVALID_TOKEN_PAYLOAD]: {
            name: ErrorsEnum[ErrorsEnum.INVALID_TOKEN_PAYLOAD],
            httpCode: 400,
            message: 'Invalid token payload.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.NEED_PASSWORD_RESET]: {
            name: ErrorsEnum[ErrorsEnum.NEED_PASSWORD_RESET],
            httpCode: 422,
            message: 'The password must be changed.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.VERIFICATION_CODE_EXPIRED]: {
            name: ErrorsEnum[ErrorsEnum.VERIFICATION_CODE_EXPIRED],
            httpCode: 403,
            message: 'This verification code has expired.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
    };

    export function createError(errosEnum: ErrorsEnum, data?: Record<string, unknown>) {
        return new ApiError({
            ...Account[errosEnum],
            ...(data && { data }),
        });
    }
}

export namespace Services {
    export enum ErrorsEnum {
        PATCH_ERROR,
        NOT_FOUND,
    }

    export const Errors: { [key: string]: IError } = {
        [ErrorsEnum.PATCH_ERROR]: {
            name: ErrorsEnum[ErrorsEnum.PATCH_ERROR],
            httpCode: 422,
            message: 'An error occurred during the patch.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
        [ErrorsEnum.NOT_FOUND]: {
            name: ErrorsEnum[ErrorsEnum.NOT_FOUND],
            httpCode: 404,
            message: 'Document not found.',
            type: ErrorTypesEnum[ErrorTypesEnum.Error],
        },
    };

    export function createError(errosEnum: ErrorsEnum, data?: Record<string, unknown>) {
        return new ApiError({
            ...Errors[errosEnum],
            ...(data && { data }),
        });
    }
}
