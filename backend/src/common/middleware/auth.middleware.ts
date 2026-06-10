import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthUserPayload } from '../utils/jwt';
import { sendError } from '../utils/response.handler';

/*------------- Express Request Extension -------------*/

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
      /** Resolved tenant school ID. Set by injectSchoolId middleware.
       *  - SUPER_ADMIN: undefined (access all schools)
       *  - all other roles: their own schoolId from JWT token */
      schoolId?: string;
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

/**
 * Middleware to resolve and inject the tenant schoolId onto req.
 * - SUPER_ADMIN: req.schoolId = undefined (unrestricted, can access all schools)
 * - All other roles: req.schoolId = their schoolId from JWT token
 * Must be used AFTER authenticate().
 */
export function injectSchoolId(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendError(res, 401, 'Authentication is required.');
    return;
  }

  if (req.user.role !== 'SUPER_ADMIN') {
    if (!req.user.schoolId) {
      sendError(res, 403, 'No school assigned to this user account.');
      return;
    }
    req.schoolId = req.user.schoolId;
  }
  // SUPER_ADMIN: req.schoolId stays undefined — no tenant restriction

  next();
}

