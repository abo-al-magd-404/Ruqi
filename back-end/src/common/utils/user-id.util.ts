import { randomBytes } from 'crypto';

export function generateUserId(): string {
  return `RUQI-${randomBytes(4).toString('hex').toUpperCase()}`;
}
