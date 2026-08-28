import { CreateProjectShell } from "@/feature/ai-redesign/components/create-project-shell";
import { SingleRoomForm } from "@/feature/ai-redesign/components/single-room/single-room-form";

export default function NewSingleRoomPage() {
  return (
    <CreateProjectShell type="single-room" wide>
      <SingleRoomForm />
    </CreateProjectShell>
  );
}
