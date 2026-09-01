import { CreateProjectShell } from "@/feature/ai-redesign/components/create-project-shell";
import { firstParam } from "@/feature/ai-redesign/lib/search-params";

export default async function NewWholeHousePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <CreateProjectShell
      type="whole_house"
      projectId={firstParam(params.projectId)}
    />
  );
}
