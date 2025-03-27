import PromptTemplateClient from "./client";

export default async function PromptTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PromptTemplateClient id={id} />;
}
