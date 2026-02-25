import { type LazyExoticComponent, type ComponentType } from "react";

export interface ModuleRoute {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  protected?: boolean;
  children?: ModuleRoute[];
}
