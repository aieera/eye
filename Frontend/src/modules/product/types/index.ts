import type { BaseEntity } from "@/shared/types/db";
import type { ProductFormData } from "../schema/productSchema";

export interface Product extends BaseEntity, ProductFormData {}
