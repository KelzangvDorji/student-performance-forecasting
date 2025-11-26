// Type definitions for Student Performance Forecasting

export interface StudentFormData {
  studentName: string;
  enrollmentNumber: string;
  midsem1Marks: number;
  midsem2Marks: number;
  comprehensiveExamMarks: number;
  attendancePercentage: number;
  studyHoursPerWeek: number;
  totalBacklogs: number;
  hasPartTimeJob: "yes" | "no";
  currentGPA: number;
  gender: "male" | "female" | "other";
  age: number;
}

export interface PredictionResponse {
  predictedGPA: number;
  academicRiskLevel: "high" | "medium" | "low";
  studentName: string;
  enrollmentNumber: string;
  recommendations?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}
