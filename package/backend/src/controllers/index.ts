import { IRouter, Router } from 'express';

import setupUserAuth from './userAuth.controller';

const router: IRouter = Router();

setupUserAuth(router);

export default router;
