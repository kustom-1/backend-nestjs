import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req['context'] = {
      timestamp: new Date(),
      sessionId: req.headers['x-session-id'],
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };
    next();
  }
}