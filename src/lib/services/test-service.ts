import { BaseService } from "./base-service";
import {
  ServiceResponse,
  ListServiceResponse,
  Row,
  Insert,
} from "@/types/service";
import { supabase } from "../supabase";

export class TestService extends BaseService<"test_cases"> {
  constructor() {
    super("test_cases");
  }

  async getTemplateTests(
    templateId: string
  ): Promise<ListServiceResponse<Row<"test_cases">>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*, test_results(*)")
        .eq("prompt_template_id", templateId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async createTest(
    data: Insert<"test_cases">
  ): Promise<ServiceResponse<Row<"test_cases">>> {
    return this.create(data);
  }

  async createTestResult(
    data: Insert<"test_results">
  ): Promise<ServiceResponse<Row<"test_results">>> {
    try {
      const { data: created, error } = await supabase
        .from("test_results")
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      return { data: created, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async getTestResults(
    testId: string
  ): Promise<ListServiceResponse<Row<"test_results">>> {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .select("*")
        .eq("test_case_id", testId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }
}

export const testService = new TestService();
