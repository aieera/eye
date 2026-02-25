import { apiSlice } from "@/shared/api/apiSlice";
import { mockLogin, mockGetMe } from "./mockAuth";
import type { User } from "@/shared/types/db";
import type { LoginFormData } from "../schema/authSchema";

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginFormData>({
      queryFn: async (credentials) => {
        try {
          const data = await mockLogin(credentials.email, credentials.password);
          return { data };
        } catch (e: any) {
          return { error: { status: 401, data: { message: e.message } } };
        }
      },
    }),
    getMe: builder.query<User, void>({
      queryFn: async (_arg, { getState }) => {
        try {
          const state = getState() as any;
          const token = state.auth.accessToken;
          const data = await mockGetMe(token);
          return { data };
        } catch (e: any) {
          return { error: { status: 401, data: { message: e.message } } };
        }
      },
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
