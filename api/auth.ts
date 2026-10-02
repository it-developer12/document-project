import { api } from "@/lib/axios";

export interface LoginRequest {
  userName: string;
  passWord: string;
}

export interface LoginResponse {
  access_token: string;
}

export interface RegisterRequest {
  userName: string;
  passWord: string;
  code: string;
}

export async function loginApi(
  data: LoginRequest,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);

  return response.data;
}

export async function registerApi(data: RegisterRequest) {
  const response = await api.post("/auth/register", data);

  return response.data;
}

export async function logoutApi() {
  const response = await api.post("/auth/logout");
  return response.data
}

export async function getMe() {
  const response = await api.get("/auth/me");

  return response.data;
}

export async function forgotPasswordApi(userName: string, code: string) {
  const response = await api.post("/auth/forgot-password", { userName, code });
  return response.data;
}

export async function resetPasswordApi(userName: string, code: string, token: string, newPassword: string) {
  const response = await api.post("/auth/reset-password", { userName, code, token, newPassword });
  return response.data;
}