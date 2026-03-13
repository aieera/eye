import React from "react";
import { useGetProductsQuery } from "../api/productApi";

function Products() {

  const { data: products = [], isLoading, error } = useGetProductsQuery();

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <h2>Products</h2>

      {products.map((product: any) => (
        <div
          key={product.id}
          style={{
            border: "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px"
          }}
        >
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>Category: {product.category}</p>

          {product.variants?.map((variant: any) => (
            <div key={variant.id}>
              <p>Price: ₹{variant.price}</p>
              <img
                src={variant.variant_media?.[0]?.media_url}
                alt={product.name}
                width="120"
              />
            </div>
          ))}
        </div>
      ))}

    </div>
  );
}

export default Products;