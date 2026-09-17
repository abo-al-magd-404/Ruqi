import { randomInt } from "crypto";

// Generate a secure 6-digit OTP
export const generateOtp = (): string => {
  return randomInt(100000, 1000000).toString();
};
