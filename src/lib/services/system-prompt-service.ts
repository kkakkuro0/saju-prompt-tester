import { BaseService } from "./base-service";
import {
  ServiceResponse,
  ListServiceResponse,
  Row,
  Insert,
} from "@/types/service";
import { supabase } from "../supabase";

export class SystemPromptService extends BaseService<"system_prompts"> {
  constructor() {
    super("system_prompts");
  }

  async getUserSystemPrompts(
    userId: string
  ): Promise<ListServiceResponse<Row<"system_prompts">>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async createSystemPrompt(
    data: Omit<Insert<"system_prompts">, "user_id">,
    userId: string
  ): Promise<ServiceResponse<Row<"system_prompts">>> {
    return this.create({ ...data, user_id: userId });
  }

  async getSystemPromptDetails(
    promptId: string,
    userId: string
  ): Promise<ServiceResponse<Row<"system_prompts">>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", promptId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const systemPromptService = new SystemPromptService();
