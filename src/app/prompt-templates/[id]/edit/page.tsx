import EditPromptTemplateClient from "./client";

export default async function EditPromptTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditPromptTemplateClient id={id} />;
}
