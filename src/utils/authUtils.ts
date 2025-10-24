// authUtils.ts - Helper functions for authentication
import api from "./api";

/**
 * Get the access token from cookies
 */
export const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("accessToken="),
  );

  if (tokenCookie) {
    return tokenCookie.split("=")[1];
  }

  return null;
};

/**
 * Save the access token to cookies
 */
export const saveAccessToken = (token: string): void => {
  if (typeof window === "undefined") return;

  // Set cookie with security options
  const isProduction = process.env.NODE_ENV === "production";
  const isSecure = window.location.protocol === "https:";
  const cookieOptions = [
    `accessToken=${token}`,
    "Path=/",
    "SameSite=Lax", // Changed from Strict to Lax for better compatibility
    ...(isProduction && isSecure ? ["Secure"] : []),
    // Set expiration to 7 days
    `Max-Age=${7 * 24 * 60 * 60}`,
  ];

  document.cookie = cookieOptions.join("; ");
};

/**
 * Remove the access token from cookies
 */
export const removeAccessToken = (): void => {
  if (typeof window === "undefined") return;

  // Set expiration date to past to delete cookie
  document.cookie =
    "accessToken=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return !!token && !isTokenExpired(token);
};

/**
 * Parse JWT token (without validation - client-side only)
 */
export const parseJwt = (token: string): Record<string, unknown> | null => {
  try {
    // Split the token and get the payload
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    throw e;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = parseJwt(token);

    if (!decoded || !decoded.exp || typeof +decoded.exp !== "number") {
      return true;
    }
    // Check if expiration time is past current time
    return +decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

/**
 * Handles logout - clears token and redirects to login
 */
export const logout = (): void => {
  removeAccessToken();
  window.location.href = "/login";
};

/**
 * Attempt to refresh the token when needed
 * Returns a promise that resolves to the new token if successful
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await api.post<{ accessToken: string }>(
      "/auth/refresh-token",
      {},
    );
    const newToken = response.data.accessToken;
    saveAccessToken(newToken);
    return newToken;
  } catch (error) {
    logout();
    throw error;
  }
};

/**
 * Check if token needs to be refreshed and refresh if needed
 * This can be called before making authenticated requests
 */
export const checkAndRefreshToken = async (): Promise<boolean> => {
  const token = getAccessToken();

  if (!token) {
    return false;
  }

  // If token is expired or will expire in the next 5 minutes, refresh it
  if (isTokenExpired(token)) {
    const newToken = await refreshToken();
    return !!newToken;
  }

  // Token is still valid
  return true;
};
