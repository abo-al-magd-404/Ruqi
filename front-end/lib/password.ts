// ============= Password Validation =============
// Password strength checks shared by signup and reset-password forms.
// Exports MIN_PASSWORD_LENGTH, evaluatePassword, getPasswordStrength, and
// the Arabic strength label map used by the UI.

export const MIN_PASSWORD_LENGTH = 8;

export interface PasswordRequirements {
  minLength: boolean;
  caseMix: boolean;
  number: boolean;
  special: boolean;
}

export function evaluatePassword(password: string): PasswordRequirements {
  return {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    caseMix: /[a-z]/.test(password) && /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>~`_\-=+[\]\\\/;]/.test(password),
  };
}

export type PasswordStrengthLevel = 1 | 2 | 3 | 4;

export const PASSWORD_STRENGTH_LABELS: Record<PasswordStrengthLevel, string> = {
  1: "ضعيفة",
  2: "متوسطة",
  3: "قوية",
  4: "قوية جداً",
};

export function getPasswordStrength(password: string): PasswordStrengthLevel {
  // Strength equals the number of met criteria, clamped to a minimum of 1
  // so even an empty password is "weak", never out of range.
  const checks = evaluatePassword(password);
  const metCount = Object.values(checks).filter(Boolean).length;
  return Math.max(1, metCount) as PasswordStrengthLevel;
}