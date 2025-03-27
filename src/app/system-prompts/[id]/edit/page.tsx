import EditSystemPromptClient from "./client";

export default async function EditSystemPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditSystemPromptClient id={id} />;
}
