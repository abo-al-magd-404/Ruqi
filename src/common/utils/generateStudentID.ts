import { randomInt } from "crypto";

// Generate a random student ID
export const generateStudentId = (): string => {
  const year = new Date().getFullYear();
  const randomNumber = randomInt(100000, 1000000);

  return `STU-${year}-${randomNumber}`;
};
