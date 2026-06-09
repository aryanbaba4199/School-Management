import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthUserPayload } from '../utils/jwt';
import { sendError } from '../utils/response.handler';

/*------------- Express Request Extension -------------*/

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/*------------- Auth Middleware Definitions -------------*/

/**
 * Middleware to authenticate requests via Bearer JWT token.
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 401, 'Authentication credentials (JWT) were not provided or are malformed.');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    sendError(res, 401, 'Invalid or expired authentication token.');
    return;
  }
}

/**
 * Middleware to restrict access to specific roles.
 */
export function requireRoles(...roles: ('SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT')[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'Authentication is required.');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 403, 'Access denied. You do not have permission to access this resource.');
      return;
    }

    next();
  };
}
