import { randomBytes } from 'node:crypto';
export function generateStudentId() {
    const randomPart = randomBytes(4).toString('hex').toUpperCase();
    return `RUQI-${randomPart}`;
}
//# sourceMappingURL=student-id.util.js.map