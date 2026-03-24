import apiClient from "./api";
import type {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
  ApiResponse,
} from "../types";

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ user: User; token: string; message?: string }>(
      "/api/auth/login",
      credentials
    );
    return {
      user: data.user,
      tokens: { accessToken: data.token, refreshToken: "" },
    };
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<{ user: User; token: string; message?: string }>(
      "/api/auth/register",
      payload
    );
    return {
      user: data.user,
      tokens: { accessToken: data.token, refreshToken: "" },
    };
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/api/auth/logout").catch(() => {});
  },

  getProfile: async (): Promise<User> => {
    const { data } = await apiClient.get<{ user: User }>("/api/auth/me");
    return data.user;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post<{ token: string }>("/api/auth/refresh", { refreshToken });
    return { accessToken: data.token, refreshToken: "" };
  },
};
