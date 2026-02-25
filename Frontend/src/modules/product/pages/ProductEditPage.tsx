import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "@/shared/components/PageContainer";
import { ProductForm } from "../components/ProductForm";
import Loader from "@/shared/components/Loader";
import { useGetProductQuery, useUpdateProductMutation } from "../api/productApi";
import { toast } from "@/hooks/use-toast";
import type { ProductFormData } from "../schema/productSchema";

const ProductEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading: fetching } = useGetProductQuery(id!);
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();

  const handleSubmit = async (data: ProductFormData) => {
    await updateProduct({ id: id!, data });
    toast({ title: "Product updated successfully" });
    navigate("/products");
  };

  if (fetching) return <Loader />;

  return (
    <PageContainer title="Edit Product" description={`Editing: ${product?.name}`}>
      <div className="m">
        <ProductForm
          mode="edit"
          defaultValues={product}
          onSubmit={handleSubmit}
          isLoading={saving}
        />
      </div>
    </PageContainer>
  );
};

export default ProductEditPage;
