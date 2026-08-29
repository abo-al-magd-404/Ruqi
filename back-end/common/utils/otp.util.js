import { randomInt } from 'node:crypto';
export function generateOtp() {
    return randomInt(100000, 1000000).toString();
}
//# sourceMappingURL=otp.util.js.map