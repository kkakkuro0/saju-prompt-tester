import SystemPromptClient from "./client";

export default async function SystemPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SystemPromptClient id={id} />;
}
