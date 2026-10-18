import { IRouter, Router } from 'express';

import setupUserAuth from './userAuth.controller';
import setupMaterials from './materials.controller';

const router: IRouter = Router();

setupUserAuth(router);
setupMaterials(router);

export default router;
