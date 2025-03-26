import { BaseService } from "./base-service";
import { ServiceResponse, Row } from "@/types/service";
import { supabase } from "../supabase";

export class UserService extends BaseService<"users"> {
  constructor() {
    super("users");
  }

  async getCurrentUser(): Promise<ServiceResponse<Row<"users">>> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!user) {
        return { data: null, error: new Error("User not found") };
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateOpenAIKey(
    userId: string,
    apiKey: string
  ): Promise<ServiceResponse<Row<"users">>> {
    return this.update(userId, { openai_api_key: apiKey });
  }
}

export const userService = new UserService();
