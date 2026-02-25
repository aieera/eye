import { useNavigate } from "react-router-dom";
import PageContainer from "@/shared/components/PageContainer";
import { ProductForm } from "../components/ProductForm";
import { useCreateProductMutation } from "../api/productApi";
import { toast } from "@/hooks/use-toast";
import type { ProductFormData } from "../schema/productSchema";

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleSubmit = async (data: ProductFormData) => {
    console.log("handle submit called",data);
    await createProduct(data);
    toast({ title: "Product created successfully" });
    navigate("/products");
  };

  return (
    <PageContainer title="Create Product" description="Add a new product to the catalog">
      <div className="">
        <ProductForm mode="create" onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </PageContainer>
  );
};

export default ProductCreatePage;
