import { supabase } from "../supabase";
import {
  ServiceResponse,
  ListServiceResponse,
  TableName,
  Row,
  Insert,
  Update,
} from "@/types/service";

export class BaseService<T extends TableName> {
  protected tableName: T;

  constructor(tableName: T) {
    this.tableName = tableName;
  }

  protected async getById(id: string): Promise<ServiceResponse<Row<T>>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  protected async list(): Promise<ListServiceResponse<Row<T>>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  protected async create(data: Insert<T>): Promise<ServiceResponse<Row<T>>> {
    try {
      const { data: created, error } = await supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return { data: created, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  protected async update(
    id: string,
    data: Update<T>
  ): Promise<ServiceResponse<Row<T>>> {
    try {
      const { data: updated, error } = await supabase
        .from(this.tableName)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return { data: updated, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  protected async delete(id: string): Promise<ServiceResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq("id", id);

      if (error) throw error;

      return { data: true, error: null };
    } catch (error) {
      return { data: false, error: error as Error };
    }
  }
}
