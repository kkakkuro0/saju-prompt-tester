import EditTemplateClient from "./client";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditTemplateClient id={id} />;
}
