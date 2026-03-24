export interface Category {
  id: string;
  name: string;
  oracleDept?: string;
  oracleClass?: string;
  oracleSubclass?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  level: "dept" | "class" | "subclass";
  displayOrder: number;
  isActive: boolean;
  _count?: { products: number; children: number };
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTreeNode {
  id: string;
  name: string;
  level: string;
  oracleDept?: string | null;
  oracleClass?: string | null;
  oracleSubclass?: string | null;
  displayOrder: number;
  productCount: number;
  children: CategoryTreeNode[];
}

export interface CreateCategoryPayload {
  name: string;
  parentId?: string | null;
  level: "dept" | "class" | "subclass";
  oracleDept?: string;
  oracleClass?: string;
  oracleSubclass?: string;
  displayOrder?: number;
}
