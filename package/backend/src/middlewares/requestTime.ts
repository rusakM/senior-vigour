import { Request, Response, NextFunction } from 'express';

export function useRequestTime(req: Request, res: Response, next: NextFunction) {
    req.params.requestTime = new Date().toISOString();
    next();
}
