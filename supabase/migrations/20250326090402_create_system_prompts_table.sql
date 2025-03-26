-- Create system_prompts table
create table if not exists public.system_prompts (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    content text not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    project_id uuid references public.projects(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.system_prompts enable row level security;

-- Create policies
create policy "Users can view their own system prompts"
    on public.system_prompts for select
    using (auth.uid() = user_id);

create policy "Users can create their own system prompts"
    on public.system_prompts for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own system prompts"
    on public.system_prompts for update
    using (auth.uid() = user_id);

create policy "Users can delete their own system prompts"
    on public.system_prompts for delete
    using (auth.uid() = user_id);

-- Create indexes
create index system_prompts_user_id_idx on public.system_prompts(user_id);
create index system_prompts_project_id_idx on public.system_prompts(project_id);
create index system_prompts_created_at_idx on public.system_prompts(created_at);

-- Set up updated_at trigger
create trigger handle_system_prompts_updated_at
    before update on public.system_prompts
    for each row
    execute procedure public.handle_updated_at();
