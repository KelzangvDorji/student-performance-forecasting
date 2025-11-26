// Centralized API service for all backend communication
// This is the ONLY file that handles backend requests

import { StudentFormData, PredictionResponse, LoginCredentials, LoginResponse } from "@/types/student";

// Base API URL - update this with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Storage key for auth token
const AUTH_TOKEN_KEY = "faculty_auth_token";

/**
 * Store authentication token in localStorage
 */
export const storeAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * Get stored authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Remove authentication token (logout)
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

/**
 * Login faculty member
 * Backend endpoint: POST /api/auth/login
 */
export const loginFaculty = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      storeAuthToken(data.token);
      return { success: true, token: data.token };
    }

    return { success: false, message: data.message || "Login failed" };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Network error. Please try again." };
  }
};

/**
 * Submit student data for performance prediction
 * Backend endpoint: POST /api/predict
 */
export const submitStudentPrediction = async (
  studentData: StudentFormData
): Promise<PredictionResponse> => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(studentData),
    });

    if (!response.ok) {
      throw new Error("Prediction request failed");
    }

    const predictionResult: PredictionResponse = await response.json();
    return predictionResult;
  } catch (error) {
    console.error("Prediction error:", error);
    throw new Error("Failed to get prediction. Please try again.");
  }
};

/**
 * Logout faculty member
 */
export const logoutFaculty = (): void => {
  clearAuthToken();
};
