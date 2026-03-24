import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Auth", "Screens", "Products", "Categories", "Offers", "Playlists", "Locations", "Schedules", "Ingestion", "Dashboard", "Logs"],
  endpoints: () => ({}),
});
