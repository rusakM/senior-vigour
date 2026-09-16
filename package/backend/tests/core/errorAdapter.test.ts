import { describe, it, expect } from 'vitest';
import { Core, Global, Game, Services, ApiError } from '../../src/core/errorAdapter';

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
    });

    describe('Game.createError', () => {
        it('should create an ApiError for GAME_NOT_FOUND', () => {
            const error = Game.createError(Game.ErrorsEnum.GAME_NOT_FOUND);
            expect(error).toBeInstanceOf(ApiError);
            expect(error.httpCode).toBe(404);
            expect(error.message).toBe('Game not found');
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
