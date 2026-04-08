import axiosInstance from "./api/axiosInstance";

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "artist" | "listener" | "admin";
export type GenderType = "male" | "female";

export interface UserSummary {
  user_id: string;
  email: string;
  display_name: string;
  gender: GenderType | null;
  role: UserRole;
  is_verified: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  display_name: string;
  firstName?: string;
  first_name: string;
  lastName?: string;
  last_name: string;
  bio: string;
  email: string;
  role: UserRole;
  avatar?: string;
  profile_picture?: string;
  coverUrl?: string;
  cover_photo?: string;
  isPro?: boolean;
  city?: string;
  country?: string;
  location?: string;
  following_ids?: string[];
  followers_ids?: string[];
  date_of_birth?: string | null;
  gender?: GenderType | null;
}

export interface AuthLoginResponseData {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: UserSummary;
  is_new_user: boolean;
}

export interface AuthRegisterResponseData {
  user_id: string;
  email: string;
  display_name: string;
  gender: GenderType;
  role: UserRole;
  is_verified: boolean;
  date_of_birth: string;
  created_at: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
  gender: GenderType;
  date_of_birth: string;
  captcha_token: string;
}

// Token helpers

function saveToken(token: string) {
  localStorage.setItem("auth_token", token);
}

function clearToken() {
  localStorage.removeItem("auth_token");
}

// Auth API functions

/** POST /auth/register */
export async function register(payload: RegisterPayload) {
  const res = await axiosInstance.post<{
    data: AuthRegisterResponseData;
    message: string;
  }>("/auth/register", payload);
  return res.data;
}

/** POST /auth/verify-email */
export async function verifyEmail(token: string) {
  const res = await axiosInstance.post<{
    data: { access_token: string; token_type: string; expires_in: number };
    message: string;
  }>("/auth/verify-email", { token });
  saveToken(res.data.data.access_token);
  return res.data;
}

/** POST /auth/resend-verification */
export async function resendVerification(email: string, captcha_token: string) {
  const res = await axiosInstance.post<{
    data: { success: boolean };
    message: string;
  }>("/auth/resend-verification", { email, captcha_token });
  return res.data;
}

/** POST /auth/login — identifier can be email or username */
export async function login(identifier: string, password: string) {
  const res = await axiosInstance.post<{
    data: AuthLoginResponseData;
    message: string;
  }>("/auth/login", { identifier, password });
  saveToken(res.data.data.access_token);
  return res.data;
}

/** POST /auth/logout */
export async function logout() {
  try {
    const res = await axiosInstance.post<{
      data: { success: boolean };
      message: string;
    }>("/auth/logout");
    return res.data;
  } finally {
    clearToken();
  }
}

/** POST /auth/refresh */
export async function refreshToken() {
  const res = await axiosInstance.post<{
    data: { access_token: string; token_type: string; expires_in: number };
    message: string;
  }>("/auth/refresh");
  saveToken(res.data.data.access_token);
  return res.data;
}

/** POST /auth/forgot-password */
export async function forgotPassword(email: string) {
  const res = await axiosInstance.post<{ message: string }>(
    "/auth/forgot-password",
    { email },
  );
  return res.data;
}

/** POST /auth/reset-password */
export async function resetPassword(
  token: string,
  new_password: string,
  confirm_password: string,
  logout_all = true,
) {
  const res = await axiosInstance.post<{
    data: { success: boolean };
    message: string;
  }>("/auth/reset-password", {
    token,
    new_password,
    confirm_password,
    logout_all,
  });
  return res.data;
}

/** POST /auth/verify-email-change */
export async function verifyEmailChange(token: string) {
  const res = await axiosInstance.post<{
    data: { email: string };
    message: string;
  }>("/auth/verify-email-change", { token });
  return res.data;
}

/** POST /auth/change-email */
export async function changeEmail(new_email: string) {
  const res = await axiosInstance.post<{
    data: { success: boolean };
    message: string;
  }>("/auth/change-email", { new_email });
  return res.data;
}

/** PATCH /users/me */
export async function updateMe(data: { display_name?: string }) {
  const res = await axiosInstance.patch<{
    data: UserProfile;
    message: string;
  }>("/users/me", data);
  return res.data;
}

/** PATCH /users/me/account — updates birth date and/or gender */
export async function updateMeAccount(data: {
  gender?: string;
  date_of_birth?: string;
}) {
  const res = await axiosInstance.patch<{
    data: UserProfile;
    message: string;
  }>("/users/me/account", data);
  return res.data;
}

/** GET /users/me */
export async function getMe() {
  const res = await axiosInstance.get<{
    data: UserProfile;
    message: string;
  }>("/users/me");
  return res.data;
}

/** POST /auth/google */
export async function googleLogin(id_token: string) {
  const res = await axiosInstance.post<{
    data: AuthLoginResponseData;
    message: string;
  }>("/auth/google", { id_token });
  saveToken(res.data.data.access_token);
  return res.data;
}

/** DELETE /auth/connections/:provider */
export async function disconnectProvider(
  provider: "google" | "facebook" | "apple",
) {
  const res = await axiosInstance.delete<{
    data: { success: boolean };
    message: string;
  }>(`/auth/connections/${provider}`);
  return res.data;
}

// ─── checkEmail ───────────────────────────────────────────────────────────────
// The OpenAPI spec has no dedicated check-email endpoint.
// This stub is used by the Email step to decide login vs. register flow.
// MSW handles it in mock mode via authHandlers.
export async function checkEmail(email: string): Promise<{ exists: boolean }> {
  try {
    const res = await axiosInstance.post<{ data: { exists: boolean } }>(
      "/auth/check-email",
      { email },
    );
    return res.data.data;
  } catch {
    // In real mode with no backend endpoint, fall back to "not found"
    return { exists: true };
  }
}
