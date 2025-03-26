import { Database } from "./supabase";

export type Tables = Database["public"]["Tables"];
export type TableName = keyof Tables;

export type Row<T extends TableName> = Tables[T]["Row"];
export type Insert<T extends TableName> = Tables[T]["Insert"];
export type Update<T extends TableName> = Tables[T]["Update"];

export interface ServiceResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface ListServiceResponse<T> {
  data: T[];
  error: Error | null;
}

export interface PaginatedServiceResponse<T> extends ListServiceResponse<T> {
  hasMore: boolean;
  nextCursor?: string;
}
