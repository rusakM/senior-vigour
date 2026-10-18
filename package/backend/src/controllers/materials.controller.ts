import { Request, Response, Router } from 'express';
import { appResponse, appRoute } from '../shared/route';
import { security } from '../shared/security';
import { materialService } from '../services';
import { ConstantsCourse, ConstantsGlobal } from '../core/constants';
import * as materialsValidation from '../middlewares/validators/materials';

export async function getByCategory(req: Request, res: Response) {
    const category = req.params.category as ConstantsCourse.Module.CATEGORY;
    const role = req.params.role as ConstantsGlobal.Account.ROLES_ENUM;

    let materials = await materialService.DB.Find.byIndex('category', category);
    if (role !== ConstantsGlobal.Account.ROLES_ENUM.MENTOR) {
        materials = materials.filter(({ type }) => type === ConstantsCourse.Material.TYPES_ENUM.INFOGRAPHIC);
    }
    return appResponse.prepareJsonResponse(res, materials);
}

export default function setup(router: Router) {
    router.get(
        appRoute.getMap().materials.getByCategory,
        security.validateAuthenticatedRequest,
        materialsValidation.validateGetByCategory,
        getByCategory
    );
}
