import { CreateProjectShell } from "@/feature/ai-redesign/components/create-project-shell";
import { firstParam } from "@/feature/ai-redesign/lib/search-params";

export default async function NewPlaceItYourselfPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <CreateProjectShell
      type="place_it_yourself"
      projectId={firstParam(params.projectId)}
    />
  );
}
