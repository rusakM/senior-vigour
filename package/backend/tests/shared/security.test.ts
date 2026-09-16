import { describe, it, expect } from 'vitest';
import { emptyBody, security } from '../../src/shared/security';
import { Request } from 'express';
import { Types } from 'mongoose';

describe('security module', () => {
    describe('emptyBody', () => {
        it('should clear request body to empty object', () => {
            const req = { body: { foo: 'bar' } } as Request;
            const result = emptyBody(req);
            expect(result.body).toEqual({});
        });
    });

    describe('validateParams', () => {
        it('should pass next() when path params ending with Id are valid Mongo ObjectIds', () => {
            const validId = new Types.ObjectId().toString();
            const req = {
                params: {
                    userId: validId,
                    otherParam: 'string-value',
                },
            } as unknown as Request;

            let nextCalled = false;
            const next = () => {
                nextCalled = true;
            };

            security.validateParams(req, {}, next);
            expect(nextCalled).toBe(true);
        });

        it('should throw validation error when path param ending with Id is invalid', () => {
            const req = {
                params: {
                    userId: 'invalid-object-id',
                },
            } as unknown as Request;

            expect(() => security.validateParams(req, {}, () => {})).toThrow();
        });
    });
});
