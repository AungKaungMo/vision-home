"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  PROJECT_TYPE_META,
  WORKFLOW_OPTIONS,
  coverGradientFor,
  newProjectHref,
  type ProjectType,
} from "@/feature/ai-redesign/constants";
import { cn } from "@/lib/utils";

export function CreateProjectDialog({
  children,
}: {
  /** The element that opens the dialog (e.g. a Button). */
  children: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleSelect(type: ProjectType) {
    setOpen(false);
    router.push(newProjectHref(type));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Create a project</DialogTitle>
          <DialogDescription>
            Choose how you want to start. You can always create more later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5">
          {WORKFLOW_OPTIONS.map((option) => {
            const meta = PROJECT_TYPE_META[option.type];
            const Icon = meta.icon;

            return (
              <button
                key={option.type}
                type="button"
                onClick={() => handleSelect(option.type)}
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-4 text-left transition-all duration-fast hover:border-terracotta-light hover:bg-surface-warm focus-visible:border-ring focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-xl bg-linear-to-br text-fg-1/70",
                    coverGradientFor(option.type),
                  )}
                >
                  <Icon aria-hidden className="size-5" strokeWidth={2} />
                </span>

                <span className="flex flex-1 flex-col">
                  <span className="font-semibold text-fg-1">{option.title}</span>
                  <span className="text-sm leading-snug text-fg-2">
                    {option.description}
                  </span>
                </span>

                <ArrowRight
                  aria-hidden
                  className="size-5 shrink-0 text-fg-3 transition-all duration-fast group-hover:translate-x-0.5 group-hover:text-terracotta"
                  strokeWidth={2}
                />
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
