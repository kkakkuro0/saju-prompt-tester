export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          openai_api_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          openai_api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          openai_api_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      system_prompts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          content: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          content: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          content?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      prompt_templates: {
        Row: {
          id: string;
          project_id: string;
          system_prompt_id: string | null;
          name: string;
          custom_system_prompt: string | null;
          user_prompt_template: string;
          model: string;
          default_parameters: Json;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          system_prompt_id?: string | null;
          name: string;
          custom_system_prompt?: string | null;
          user_prompt_template: string;
          model: string;
          default_parameters: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          system_prompt_id?: string | null;
          name?: string;
          custom_system_prompt?: string | null;
          user_prompt_template?: string;
          model?: string;
          default_parameters?: Json;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      test_cases: {
        Row: {
          id: string;
          prompt_template_id: string;
          variables: Json;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_template_id: string;
          variables: Json;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_template_id?: string;
          variables?: Json;
          description?: string | null;
          created_at?: string;
        };
      };
      test_results: {
        Row: {
          id: string;
          test_case_id: string;
          response: string;
          tokens_used: number;
          completion_time: number;
          parameters_used: Json;
          feedback: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          test_case_id: string;
          response: string;
          tokens_used: number;
          completion_time: number;
          parameters_used: Json;
          feedback?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          test_case_id?: string;
          response?: string;
          tokens_used?: number;
          completion_time?: number;
          parameters_used?: Json;
          feedback?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
