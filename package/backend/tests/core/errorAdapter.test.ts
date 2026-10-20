import { describe, it, expect } from 'vitest';
import { Core, Global, Game, Poll, Services, ApiError } from '../../src/core/errorAdapter';

describe('errorAdapter', () => {
    describe('Core.createError', () => {
        it('should create an ApiError for UNEXPECTED_ERROR', () => {
            const error = Core.createError(Core.ErrorsEnum.UNEXPECTED_ERROR);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(500);
            expect(error.message).toBe('Unexpected error.');
            expect(error.name).toBe('UNEXPECTED_ERROR');
        });

        it('should attach custom data payload to error when provided', () => {
            const data = { field: 'email', reason: 'invalid format' };
            const error = Core.createError(Core.ErrorsEnum.VALIDATION_ERROR, data);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(404);
            expect(error.data).toEqual(data);
        });
    });

    describe('Global.createError', () => {
        it('should create an ApiError for INVALID_EMAIL_OR_PASSWORD', () => {
            const error = Global.createError(Global.ErrorsEnum.INVALID_EMAIL_OR_PASSWORD);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(403);
            expect(error.message).toBe('Invalid email or password.');
        });

        it('should create an ApiError for ASSET_NOT_FOUND', () => {
            const error = Global.createError(Global.ErrorsEnum.ASSET_NOT_FOUND);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(404);
            expect(error.message).toBe('Asset not found.');
        });
    });

    describe('Game.createError', () => {
        it('should create an ApiError for GAME_NOT_FOUND', () => {
            const error = Game.createError(Game.ErrorsEnum.GAME_NOT_FOUND);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(404);
            expect(error.message).toBe('Game not found');
        });
    });

    describe('Poll.createError', () => {
        it('should create an ApiError for QUESTION_NOT_FOUND', () => {
            const error = Poll.createError(Poll.ErrorsEnum.QUESTION_NOT_FOUND);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(404);
            expect(error.message).toBe('Question not found.');
        });

        it('should create an ApiError for PLAYER_POLL_NOT_FOUND', () => {
            const error = Poll.createError(Poll.ErrorsEnum.PLAYER_POLL_NOT_FOUND);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(404);
            expect(error.message).toBe('Player poll not found.');
        });

        it('should create an ApiError for POLL_ALREADY_FINISHED', () => {
            const error = Poll.createError(Poll.ErrorsEnum.POLL_ALREADY_FINISHED);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(422);
            expect(error.message).toBe('Poll has already been finished.');
        });

        it('should create an ApiError for SENIOR_DETAILS_REQUIRED', () => {
            const error = Poll.createError(Poll.ErrorsEnum.SENIOR_DETAILS_REQUIRED);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(422);
            expect(error.message).toBe('Senior first name and last name are required.');
        });
    });

    describe('Services.createError', () => {
        it('should create an ApiError for NOT_FOUND', () => {
            const error = Services.createError(Services.ErrorsEnum.NOT_FOUND);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(404);
            expect(error.message).toBe('Document not found.');
        });
    });
});
