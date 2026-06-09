import { sign, verify } from 'jsonwebtoken';

/*------------- Token Payload Interface -------------*/

export interface AuthUserPayload {
  userId: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';
  schoolId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-super-secret-key-12345';
const JWT_EXPIRES_IN = '24h';

/*------------- Token Management Functions -------------*/

/**
 * Generates a signed JWT token containing user details.
 */
export function generateToken(payload: AuthUserPayload): string {
  return sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifies a JWT token and returns its decoded payload.
 * Throws an error if validation fails.
 */
export function verifyToken(token: string): AuthUserPayload {
  const decoded = verify(token, JWT_SECRET);
  return decoded as AuthUserPayload;
}
