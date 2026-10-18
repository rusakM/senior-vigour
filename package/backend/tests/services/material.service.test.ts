import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DB, Model } from '../../src/services/material.service';
import { ConstantsCourse } from '../../src/core/constants';

describe('material.service', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    describe('DB.Find.byIndex', () => {
        it('should find materials by category', async () => {
            const mockMaterials = [
                {
                    name: 'Info_1',
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    type: ConstantsCourse.Material.TYPES_ENUM.INFOGRAPHIC,
                },
                {
                    name: 'Handbook_1',
                    category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                    type: ConstantsCourse.Material.TYPES_ENUM.HANDBOOK,
                },
            ];

            const findSpy = vi.spyOn(Model.Material, 'find').mockReturnValue({
                lean: () => ({
                    exec: async () => mockMaterials,
                }),
            } as any);

            const result = await DB.Find.byIndex(
                'category',
                ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH
            );

            expect(findSpy).toHaveBeenCalledWith({
                category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
            });
            expect(result).toEqual(mockMaterials);
        });

        it('should find single material by name when limit is 1', async () => {
            const mockMaterial = {
                name: 'Handbook_PDF',
                category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
                type: ConstantsCourse.Material.TYPES_ENUM.HANDBOOK,
            };

            const mockQuery = {
                limit: vi.fn().mockReturnThis(),
                lean: vi.fn().mockReturnValue({
                    exec: async () => [mockMaterial],
                }),
            };

            vi.spyOn(Model.Material, 'find').mockReturnValue(mockQuery as any);

            const result = await DB.Find.byIndex('name', 'Handbook_PDF', 1);

            expect(mockQuery.limit).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockMaterial);
        });

        it('should return undefined when single material by name is not found (limit 1)', async () => {
            const mockQuery = {
                limit: vi.fn().mockReturnThis(),
                lean: vi.fn().mockReturnValue({
                    exec: async () => [],
                }),
            };

            vi.spyOn(Model.Material, 'find').mockReturnValue(mockQuery as any);

            const result = await DB.Find.byIndex('name', 'NonExistent', 1);

            expect(result).toBeUndefined();
        });

        it('should catch database errors and return empty array', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.spyOn(Model.Material, 'find').mockImplementation(() => {
                throw new Error('Database error');
            });

            const result = await DB.Find.byIndex(
                'category',
                ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH
            );

            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('DB.Find.byId', () => {
        it('should return material by id when found', async () => {
            const mockMaterial = {
                _id: 'mat123',
                name: 'Handbook_PDF',
                category: ConstantsCourse.Module.CATEGORY.MENTAL_HEALTH,
            };

            vi.spyOn(Model.Material, 'findById').mockReturnValue({
                lean: () => ({
                    exec: async () => mockMaterial,
                }),
            } as any);

            const result = await DB.Find.byId('mat123');

            expect(result).toEqual(mockMaterial);
        });

        it('should return null when material is not found by id', async () => {
            vi.spyOn(Model.Material, 'findById').mockReturnValue({
                lean: () => ({
                    exec: async () => null,
                }),
            } as any);

            const result = await DB.Find.byId('nonexistent');

            expect(result).toBeNull();
        });
    });
});
