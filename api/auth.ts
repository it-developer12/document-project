import { api } from "@/lib/axios";

export interface LoginRequest {
  userName: string;
  passWord: string;
}

export interface LoginResponse {
  access_token: string;
}

export async function loginApi(
  data: LoginRequest,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);

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