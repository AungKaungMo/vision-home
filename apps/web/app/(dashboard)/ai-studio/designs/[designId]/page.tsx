import { SingleRoomForm } from "@/feature/ai-redesign/components/single-room/single-room-form";

export default async function DesignDetailPage({
  params,
}: {
  params: Promise<{ designId: string }>;
}) {
  const { designId } = await params;

  return <SingleRoomForm designId={designId} />;
}
