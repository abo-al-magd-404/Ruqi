import { randomBytes } from 'crypto';
export function generateUserId() {
    return `RUQI-${randomBytes(4).toString('hex').toUpperCase()}`;
}
//# sourceMappingURL=user-id.util.js.map