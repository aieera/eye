import type { DynamicFormConfig } from "@/shared/types/form";
import { productSchema } from "../schema/productSchema";

export const productFormConfig: DynamicFormConfig = {
  schema: productSchema,
  columns: 2,
  fields: [
    { name: "name", label: "Product Name", type: "text", placeholder: "Enter product name", colSpan: 2 },
    { name: "description", label: "Description", type: "textarea", placeholder: "Enter description", colSpan: 2 },
    { name: "price", label: "Price", type: "number", placeholder: "0.00" },
    { name: "stock", label: "Stock", type: "number", placeholder: "0" },
    { name: "sku", label: "SKU", type: "text", placeholder: "XX-000" },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { label: "Electronics", value: "Electronics" },
        { label: "Office", value: "Office" },
        { label: "Furniture", value: "Furniture" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { label: "Active", value: "active" },
        { label: "Draft", value: "draft" },
        { label: "Archived", value: "archived" },
      ],
    },
  ],
};
