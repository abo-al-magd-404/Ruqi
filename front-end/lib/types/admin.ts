export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED";

export interface AdminStageRef {
  _id: string;
  title: string;
}

export interface AdminMonthRef {
  _id: string;
  title: string;
  description?: string;
  price?: number;
  order?: number;
}

export interface AdminStudent {
  _id: string;
  studentId?: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role: string;
  status: UserStatus;
  avatar?: string | null;
  stage?: AdminStageRef | string | null;
  subscribedMonths?: AdminMonthRef[] | string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateStudentPayload {
  name?: string;
  password?: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  stage?: string;
}

export interface UpdateStudentStatusPayload {
  status: UserStatus;
}

export interface SubscribedMonthsResult {
  student: {
    _id: string;
    studentId?: string;
    name: string;
    subscribedMonths: AdminMonthRef[];
  };
}
