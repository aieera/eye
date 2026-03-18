import { useState, useEffect } from "react";
import { useGetOffersQuery } from "../api/offerApi";
import Pagination from "../../../shared/components/Pagination";
import OfferTable from "../components/OfferTable";

export default function Offers() {

  const { data: offers = [] } = useGetOffersQuery();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredOffers = offers.filter((offer) =>
    offer.name.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;
  const paginatedOffers = filteredOffers.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [filteredOffers]);

  return (
    <div className="p-1 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">Offers</h1>
        <p className="text-sm text-gray-500 mt-1">Manage promotional offers</p>
      </div>

<OfferTable offers={paginatedOffers} />

      <Pagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

    </div>
  );
}