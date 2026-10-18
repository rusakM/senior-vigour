import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction, Router } from 'express';
import { getByCategory, default as setupMaterials } from '../../src/controllers/materials.controller';
import { validateGetByCategory } from '../../src/middlewares/validators/materials';
import { materialService } from '../../src/services';
import { ConstantsCourse, ConstantsGlobal } from '../../src/core/constants';
import { ApiError } from '../../src/core/errorAdapter';

function createMockReqRes(reqOptions: Partial<Request> = {}) {
    const req = {
        body: {},
        params: {},
        headers: {},
        ...reqOptions,
    } as unknown as Request;

    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);

    return { req, res };
}

describe('materials.controller', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('getByCategory', () => {
        it('should return only INFOGRAPHIC materials for SENIOR role', async () => {
            const allMaterials = [
                {
                    name: 'Handbook_1',
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    type: ConstantsCourse.Material.TYPES_ENUM.HANDBOOK,
                },
                {
                    name: 'Info_1',
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    type: ConstantsCourse.Material.TYPES_ENUM.INFOGRAPHIC,
                },
            ] as any[];

            const { req, res } = createMockReqRes({
                params: {
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    role: ConstantsGlobal.Account.ROLES_ENUM.SENIOR,
                } as any,
            });

            const findSpy = vi
                .spyOn(materialService.DB.Find, 'byIndex')
                .mockResolvedValue(allMaterials);

            await getByCategory(req, res);

            expect(findSpy).toHaveBeenCalledWith(
                'category',
                ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith([allMaterials[1]]);
        });

        it('should return all materials for MENTOR role', async () => {
            const allMaterials = [
                {
                    name: 'Handbook_1',
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    type: ConstantsCourse.Material.TYPES_ENUM.HANDBOOK,
                },
                {
                    name: 'Info_1',
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    type: ConstantsCourse.Material.TYPES_ENUM.INFOGRAPHIC,
                },
            ] as any[];

            const { req, res } = createMockReqRes({
                params: {
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    role: ConstantsGlobal.Account.ROLES_ENUM.MENTOR,
                } as any,
            });

            const findSpy = vi
                .spyOn(materialService.DB.Find, 'byIndex')
                .mockResolvedValue(allMaterials);

            await getByCategory(req, res);

            expect(findSpy).toHaveBeenCalledWith(
                'category',
                ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(allMaterials);
        });
    });

    describe('validateGetByCategory middleware', () => {
        it('should call next() when category is valid', () => {
            const { req, res } = createMockReqRes({
                params: {
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                } as any,
            });
            const next = vi.fn() as NextFunction;

            validateGetByCategory(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should throw ApiError when category is invalid', () => {
            const { req, res } = createMockReqRes({
                params: {
                    category: 'INVALID_CATEGORY',
                } as any,
            });
            const next = vi.fn() as NextFunction;

            expect(() => validateGetByCategory(req, res, next)).toThrowError(ApiError);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('setupMaterials router', () => {
        it('should register GET endpoint on router', () => {
            const router = {
                get: vi.fn(),
            } as unknown as Router;

            setupMaterials(router);

            expect(router.get).toHaveBeenCalledWith(
                '/api/materials/:category',
                expect.any(Function),
                expect.any(Function),
                expect.any(Function)
            );
        });
    });
});
