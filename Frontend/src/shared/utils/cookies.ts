import Cookies from "js-cookie";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, REFRESH_EXPIRY_DAYS } from "@/app/constants";

export const setAccessToken = (token: string) => {
  Cookies.set(ACCESS_TOKEN_KEY, token, { sameSite: "strict" });
};

export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  Cookies.set(REFRESH_TOKEN_KEY, token, {
    expires: REFRESH_EXPIRY_DAYS,
    sameSite: "strict",
  });
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};
