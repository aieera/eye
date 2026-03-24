import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { API_BASE_URL } from "@/app/constants";
import {
  getAccessToken,
  setAccessToken,
  clearTokens,
} from "@/shared/utils/cookies";
import { logout, setCredentials } from "@/modules/auth/store/authSlice";

const baseQuery = fetchBaseQuery({
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

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { success: boolean; data: { accessToken: string } };
      if (data.success && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);
        // Retry the original request
        result = await baseQuery(args, api, extraOptions);
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
