import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_BASE_URL } from "@/app/constants";

export const baseQueryWithReauth = fetchBaseQuery({
  baseUrl: API_BASE_URL, 
});