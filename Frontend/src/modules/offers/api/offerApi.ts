import { apiSlice } from "@/shared/api/apiSlice";
import { Offer } from "../types/offer.types";

export const offersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getOffers: builder.query<Offer[], void>({
      query: () => "/offers",
      providesTags: ["Offers"],
    }),

  }),
});

export const {
  useGetOffersQuery
} = offersApi;