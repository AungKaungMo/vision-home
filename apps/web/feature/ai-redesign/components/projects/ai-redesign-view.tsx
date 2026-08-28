import { Plus, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/feature/ai-redesign/components/create-project-dialog";
import { ProjectGrid } from "@/feature/ai-redesign/components/projects/project-grid";

export function AiRedesignView() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold tracking-wider text-fg-3 uppercase">
            <Wand2 aria-hidden className="size-3.5" strokeWidth={2.25} />
            AI Redesign
          </span>
          <h1 className="max-w-2xl text-3xl text-fg-1">
            Your redesign projects
          </h1>
          <p className="max-w-xl text-md leading-relaxed text-fg-2">
            Start a new redesign — a single room, a whole house, or place pieces
            yourself — and pick up any project right where you left off.
          </p>
        </div>

        <CreateProjectDialog>
          <Button size="lg" className="shrink-0 shadow-primary">
            <Plus aria-hidden strokeWidth={2.5} />
            Create project
          </Button>
        </CreateProjectDialog>
      </header>

      <ProjectGrid />
    </div>
  );
}
