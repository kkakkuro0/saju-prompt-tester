import { BaseService } from "./base-service";
import {
  ServiceResponse,
  ListServiceResponse,
  Row,
  Insert,
} from "@/types/service";
import { supabase } from "../supabase";

export class ProjectService extends BaseService<"projects"> {
  constructor() {
    super("projects");
  }

  async getUserProjects(
    userId: string
  ): Promise<ListServiceResponse<Row<"projects">>> {
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

  async createProject(
    data: Omit<Insert<"projects">, "user_id">,
    userId: string
  ): Promise<ServiceResponse<Row<"projects">>> {
    return this.create({ ...data, user_id: userId });
  }

  async getProjectDetails(
    projectId: string,
    userId: string
  ): Promise<ServiceResponse<Row<"projects">>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("id", projectId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }
}

export const projectService = new ProjectService();
