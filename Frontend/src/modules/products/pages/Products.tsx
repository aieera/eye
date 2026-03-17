import { useState } from "react";
import { useGetProductsQuery } from "../api/productApi";
import ProductToolbar from "../components/ProductToolbar";
import ProductTable from "../components/ProductTable";
import Pagination from "../../../shared/components/Pagination";

export default function Products() {

  const { data: products = [], isLoading } = useGetProductsQuery();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const itemsPerPage = 6;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const start = (page - 1) * itemsPerPage;

  const paginatedProducts = filteredProducts.slice(start, start + itemsPerPage);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-semibold">Products</h1>
        <p className="text-gray-500">Products</p>
      </div>

      <ProductToolbar
        search={search}
        setSearch={setSearch}
      />

      <ProductTable products={paginatedProducts} />

      <Pagination
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

    </div>
  );
}