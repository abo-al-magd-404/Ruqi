export function generateStudentId(): string {
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(10000 + Math.random() * 900000);
  return `STU-${year}-${randomDigits}`;
}
