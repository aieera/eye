import { apiSlice } from "@/shared/api/apiSlice";
import type { LoginFormData } from "../schema/authSchema";
import type { User } from "@/shared/types/db";

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginFormData>({
      query: (credentials) => ({
        url: `/users`,
        method: "GET",
        params: {
          email: credentials.email,
          password: credentials.password,
          role: "admin",
        },
      }),
      transformResponse: (response: User[]) => {
        if (!response.length) {
          throw new Error("Invalid credentials");
        }

        return {
          user: response[0],
          accessToken: "dummy-token",
        };
      },
    }),
  }),
});


export const { useLoginMutation } = authApi;