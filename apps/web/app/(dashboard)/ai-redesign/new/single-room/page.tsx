import { CreateProjectShell } from "@/feature/ai-redesign/components/create-project-shell";
import { SingleRoomForm } from "@/feature/ai-redesign/components/single-room/single-room-form";
import { firstParam } from "@/feature/ai-redesign/lib/search-params";

export default async function NewSingleRoomPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const projectId = firstParam(params.projectId);

  return (
    <CreateProjectShell type="single_room" wide projectId={projectId}>
      <SingleRoomForm projectId={projectId} />
    </CreateProjectShell>
  );
}
