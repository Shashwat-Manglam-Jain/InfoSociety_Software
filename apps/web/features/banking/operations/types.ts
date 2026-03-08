import type { HttpMethod } from "@/shared/api/client";

export type OperationFieldType = "text" | "number" | "boolean" | "date" | "select" | "json";
export type OperationFieldLocation = "path" | "query" | "body";

export type OperationField = {
  key: string;
  label: string;
  type: OperationFieldType;
  location: OperationFieldLocation;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
};

export type ModuleOperation = {
  id: string;
  title: string;
  description: string;
  method: HttpMethod;
  path: string;
  fields?: OperationField[];
};

export type ModuleWorkspaceConfig = {
  slug: string;
  operations: ModuleOperation[];
};
