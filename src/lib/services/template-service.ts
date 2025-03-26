import { BaseService } from "./base-service";
import {
  ServiceResponse,
  ListServiceResponse,
  Row,
  Insert,
} from "@/types/service";
import { supabase } from "../supabase";

export class TemplateService extends BaseService<"prompt_templates"> {
  constructor() {
    super("prompt_templates");
  }

  async getProjectTemplates(
    projectId: string
  ): Promise<ListServiceResponse<Row<"prompt_templates">>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*, system_prompts(*)")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error: error as Error };
    }
  }

  async createTemplate(
    data: Omit<Insert<"prompt_templates">, "version">
  ): Promise<ServiceResponse<Row<"prompt_templates">>> {
    return this.create({ ...data, version: 1 });
  }

  async getTemplateDetails(
    templateId: string,
    projectId: string
  ): Promise<ServiceResponse<Row<"prompt_templates">>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*, system_prompts(*)")
        .eq("id", templateId)
        .eq("project_id", projectId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  async updateTemplate(
    templateId: string,
    data: Omit<Insert<"prompt_templates">, "version" | "project_id">
  ): Promise<ServiceResponse<Row<"prompt_templates">>> {
    try {
      const current = await this.getById(templateId);
      if (current.error) throw current.error;
      if (!current.data) throw new Error("Template not found");

      return this.update(templateId, {
        ...data,
        version: current.data.version + 1,
      });
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const templateService = new TemplateService();
