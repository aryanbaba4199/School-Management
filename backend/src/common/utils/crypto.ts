import { pbkdf2Sync, randomBytes } from 'crypto';

/*------------- Cryptographic Constants -------------*/

const ITERATIONS = 10000;
const KEY_LEN = 64;
const DIGEST = 'sha512';
const SALT_LEN = 16;

/*------------- Password Hashing Functions -------------*/

/**
 * Hashes a plaintext password using PBKDF2.
 * Returns the hash in the format: salt.hash (hex format)
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN).toString('hex');
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return `${salt}.${hash}`;
}

/**
 * Verifies a plaintext password against a stored hashed password.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split('.');
  if (parts.length !== 2) {
    return false;
  }
  const [salt, originalHash] = parts;
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return hash === originalHash;
}
