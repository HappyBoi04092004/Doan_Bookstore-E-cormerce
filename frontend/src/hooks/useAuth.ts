import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/authStore";
import type { LoginCredentials, RegisterPayload } from "../types";

export function useAuth() {
  const { user, isAuthenticated, accessToken, setUser, logout } =
    useAuthStore();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authService.login(credentials),
    onSuccess: ({ user, tokens }) => {
      setUser(user, tokens.accessToken);
      navigate(user.role === "admin" ? "/admin" : "/");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: ({ user, tokens }) => {
      setUser(user, tokens.accessToken);
      navigate("/");
    },
  });

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore network errors on logout
    } finally {
      logout();
      navigate("/login");
    }
  };

  const loginWithToken = useCallback(async (token: string) => {
    try {
      // Set token temporarily in store so apiClient can use it
      useAuthStore.setState({ accessToken: token });
      const userProfile = await authService.getProfile();
      setUser(userProfile, token);
      navigate(userProfile.role === "admin" ? "/admin" : "/");
    } catch (error) {
      console.error("Failed to login with token", error);
      logout();
    }
  }, [navigate, setUser, logout]);

  return {
    user,
    isAuthenticated,
    accessToken,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    loginWithToken,
    logout: handleLogout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
