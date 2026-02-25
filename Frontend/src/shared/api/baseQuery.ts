import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { API_BASE_URL } from "@/app/constants";
import { getAccessToken, setAccessToken, setRefreshToken, clearTokens, getRefreshToken } from "@/shared/utils/cookies";
import { logout, setCredentials } from "@/modules/auth/store/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const data = refreshResult.data as { accessToken: string; refreshToken: string; user: any };
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        api.dispatch(setCredentials({ user: data.user, accessToken: data.accessToken }));
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        clearTokens();
        api.dispatch(logout());
      }
    } else {
      clearTokens();
      api.dispatch(logout());
    }
  }

  return result;
};
