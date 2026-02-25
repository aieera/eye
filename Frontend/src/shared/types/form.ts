import { type ZodType } from "zod";

export type FieldType = "text" | "number" | "select" | "date" | "textarea" | "file" | "checkbox";

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: SelectOption[];
  required?: boolean;
  colSpan?: 1 | 2 | 3 | 4;
  accept?: string; // for file inputs
}

export interface DynamicFormConfig {
  fields: FormFieldConfig[];
  schema: ZodType;
  columns?: 1 | 2 | 3 | 4;
}
