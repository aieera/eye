import type { User } from "@/shared/types/db";

const MOCK_USER: User = {
  id: "1",
  email: "admin@eye.com",
  name: "Admin User",
  role: "admin",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

let mockAccessToken = "mock-access-token-" + Date.now();
let mockRefreshToken = "mock-refresh-token-" + Date.now();

export const mockLogin = async (email: string, password: string) => {
  await delay(800);
  if (email === "admin@eye.com" && password === "password") {
    mockAccessToken = "mock-access-token-" + Date.now();
    mockRefreshToken = "mock-refresh-token-" + Date.now();
    return { user: MOCK_USER, accessToken: mockAccessToken, refreshToken: mockRefreshToken };
  }
  throw new Error("Invalid credentials");
};

export const mockRefresh = async (_refreshToken: string) => {
  await delay(300);
  mockAccessToken = "mock-access-token-" + Date.now();
  return { user: MOCK_USER, accessToken: mockAccessToken, refreshToken: mockRefreshToken };
};

export const mockGetMe = async (token: string) => {
  await delay(200);
  if (token) return MOCK_USER;
  throw new Error("Unauthorized");
};
