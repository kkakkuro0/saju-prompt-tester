-- Create prompt_templates table
create table if not exists public.prompt_templates (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    content text not null,
    variables jsonb not null default '[]'::jsonb,
    user_id uuid references auth.users(id) on delete cascade not null,
    project_id uuid references public.projects(id) on delete cascade,
    system_prompt_id uuid references public.system_prompts(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.prompt_templates enable row level security;

-- Create policies
create policy "Users can view their own prompt templates"
    on public.prompt_templates for select
    using (auth.uid() = user_id);

create policy "Users can create their own prompt templates"
    on public.prompt_templates for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own prompt templates"
    on public.prompt_templates for update
    using (auth.uid() = user_id);

create policy "Users can delete their own prompt templates"
    on public.prompt_templates for delete
    using (auth.uid() = user_id);

-- Create indexes
create index prompt_templates_user_id_idx on public.prompt_templates(user_id);
create index prompt_templates_project_id_idx on public.prompt_templates(project_id);
create index prompt_templates_system_prompt_id_idx on public.prompt_templates(system_prompt_id);
create index prompt_templates_created_at_idx on public.prompt_templates(created_at);

-- Set up updated_at trigger
create trigger handle_prompt_templates_updated_at
    before update on public.prompt_templates
    for each row
    execute procedure public.handle_updated_at();
