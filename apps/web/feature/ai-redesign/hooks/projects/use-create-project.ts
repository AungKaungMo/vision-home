"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@repo/schemas/projects";

import { createProject } from "@/feature/ai-redesign/api/projects";
import { newProjectHref } from "@/feature/ai-redesign/constants";
import { useRoomTypeSelect } from "@/feature/ai-redesign/hooks/projects/use-room-type-select";

export function useCreateProject() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const roomType = useRoomTypeSelect();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    mode: "onChange",
    defaultValues: { name: "", description: "", type: "single_room" },
  });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      if (!project) {
        toast.error("Couldn't create project");
        return;
      }
      const params = new URLSearchParams({ projectId: project.id });
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      router.push(`${newProjectHref(project.type)}?${params.toString()}`);
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Couldn't create project",
      ),
  });

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset();
      roomType.reset();
    }
  }

  const submit = form.handleSubmit((values) => {
    const selected = roomType.selected;
    const room =
      values.type === "single_room" && selected
        ? selected.kind === "existing"
          ? { roomTypeId: selected.value }
          : { roomTypeLabel: selected.label }
        : {};

    mutation.mutate({
      ...values,
      description: values.description || undefined,
      ...room,
    });
  });

  return {
    open,
    onOpenChange,
    form,
    roomType,
    submit,
    isSubmitting: mutation.isPending,
  };
}
