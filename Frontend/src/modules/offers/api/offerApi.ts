import { apiSlice } from "@/shared/api/apiSlice";
import type { Offer, OffersListParams, CreateOfferPayload } from "../types/offer.types";

export const offerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOffers: builder.query<
      { data: Offer[]; meta: { pagination: any } },
      OffersListParams | void
    >({
      query: (params) => ({ url: "/offers", params: params || {} }),
      providesTags: ["Offers"],
    }),

    getOfferById: builder.query<{ data: Offer }, string>({
      query: (id) => `/offers/${id}`,
      providesTags: (_r, _e, id) => [{ type: "Offers", id }],
    }),

    getActiveOffers: builder.query<{ data: Offer[] }, string | void>({
      query: (locationId) => ({
        url: "/offers/active",
        params: locationId ? { locationId } : {},
      }),
      providesTags: ["Offers"],
    }),

    createOffer: builder.mutation<{ data: Offer }, CreateOfferPayload>({
      query: (body) => ({ url: "/offers", method: "POST", body }),
      invalidatesTags: ["Offers"],
    }),

    updateOffer: builder.mutation<
      { data: Offer },
      { id: string; body: Partial<CreateOfferPayload> & { isActive?: boolean } }
    >({
      query: ({ id, body }) => ({ url: `/offers/${id}`, method: "PUT", body }),
      invalidatesTags: ["Offers"],
    }),

    deleteOffer: builder.mutation<void, string>({
      query: (id) => ({ url: `/offers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Offers"],
    }),
  }),
});

export const {
  useGetOffersQuery,
  useGetOfferByIdQuery,
  useGetActiveOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} = offerApi;
