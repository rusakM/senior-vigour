import { IRouter, Router } from 'express';

import setupUserAuth from './userAuth.controller';
import setupMaterials from './materials.controller';
import setupPoll from './poll.controller';

const router: IRouter = Router();

setupUserAuth(router);
setupMaterials(router);
setupPoll(router);

export default router;
