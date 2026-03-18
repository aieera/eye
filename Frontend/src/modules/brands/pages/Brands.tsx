import { useState, useEffect } from "react";
import { useGetBrandsQuery } from "../api/brandApi";
import Pagination from "../../../shared/components/Pagination";
import BrandTable from "../components/BrandTable";

export default function Brands() {

  const { data: brands = [] } = useGetBrandsQuery();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;

  const paginatedBrands = filteredBrands.slice(start, start + itemsPerPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [filteredBrands]);

  return (
    <div className="p-1 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">Brands</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage product brands
        </p>
      </div>

      <BrandTable brands={paginatedBrands} />

      <Pagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

    </div>
  );
}