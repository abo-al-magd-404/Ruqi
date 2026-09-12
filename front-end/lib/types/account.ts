export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  stage: string;
}

export interface SignupResult {
  message: string;
  email: string;
}

export interface VerifyAccountPayload {
  email: string;
  otp: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResult {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId: string | null;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface UserProfile {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  role: string;
  status: string;
  stage: string;
  avatar?: string;
  subscribedMonths: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStudentProfilePayload {
  name?: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  stage?: string;
  avatar?: string;
  subscribedMonths?: string[];
}