import { randomBytes } from 'node:crypto';

export function generateStudentId(): string {
  const randomPart = randomBytes(4).toString('hex').toUpperCase();
  return `RUQI-${randomPart}`;
}
