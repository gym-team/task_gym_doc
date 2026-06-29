import { api } from "./api";
import { CurrentUser } from "@/types/user";
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const login = async (
  data: LoginRequest
) => {
  const response: any = await api.post(
    "/api/Account/Login",
    data
  );

  if (response?.token) {
    localStorage.setItem(
      "token",
      response.token
    );
  }

  return response;
};



export const logout = () => {
  localStorage.removeItem("token");
};

export const getToken = () =>
  localStorage.getItem("token");










export const getCurrentUser = () =>
  api.get<CurrentUser>(
    "/api/Account/me"
  );