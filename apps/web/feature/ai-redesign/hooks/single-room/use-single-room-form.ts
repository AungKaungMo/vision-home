"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GenerateSource } from "@repo/schemas/projects";

import {
  DEFAULT_ROOM_STYLE,
  type PhotoSource,
} from "@/feature/ai-redesign/constants";
import {
  generateDesign,
  uploadSourceImage,
} from "@/feature/ai-redesign/api/projects";
import { useProject } from "@/feature/ai-redesign/hooks/queries/use-project";

async function buildGenerateSource(
  projectId: string,
  source: PhotoSource,
): Promise<GenerateSource> {
  if (source.kind === "sample") {
    return { kind: "sample", id: source.id, imageUrl: source.imageUrl };
  }

  const uploaded = await uploadSourceImage(projectId, source.file);

  return {
    kind: "upload",
    ...uploaded,
  };
}

export type UseSingleRoomForm = {
  roomTypeId: string | undefined;
  source: PhotoSource | null;
  onSourceChange: (next: PhotoSource | null) => void;
  styles: string[];
  setStyles: Dispatch<SetStateAction<string[]>>;
  details: string;
  setDetails: Dispatch<SetStateAction<string>>;
  canGenerate: boolean;
  isGenerating: boolean;
  generate: () => void;
  generationId: string | null;
  selectGeneration: (generationId: string) => void;
  isProjectLoading: boolean;
};

export function useSingleRoomForm(projectId?: string): UseSingleRoomForm {
  const queryClient = useQueryClient();
  const { data: project, isLoading: isProjectLoading } = useProject(projectId);
  const roomTypeId = project?.room?.roomTypeId ?? undefined;

  const [source, setSource] = useState<PhotoSource | null>(null);
  const [styles, setStyles] = useState<string[]>([DEFAULT_ROOM_STYLE]);
  const [details, setDetails] = useState("");
  const [generationSelection, setGenerationSelection] = useState<{
    projectId: string | undefined;
    generationId: string | null;
  } | null>(null);
  const generationId =
    generationSelection !== null && generationSelection.projectId === projectId
      ? generationSelection.generationId
      : (project?.latestGenerationId ?? null);

  // Own the uploaded object URL's lifecycle here, since both PhotoUpload and
  // RoomTypePicker swap `source`: revoke the previous upload URL on every
  // change (and on unmount) so blobs never leak.
  const objectUrlRef = useRef<string | null>(null);

  const onSourceChange = useCallback((next: PhotoSource | null) => {
    const nextUrl = next?.kind === "upload" ? next.url : null;
    if (objectUrlRef.current && objectUrlRef.current !== nextUrl) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    objectUrlRef.current = nextUrl;
    setSource(next);
  }, []);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const mutation = useMutation({
    mutationFn: async ({
      projectId,
      source,
    }: {
      projectId: string;
      source: PhotoSource;
    }) => {
      const generateSource = await buildGenerateSource(projectId, source);
      return generateDesign(projectId, {
        source: generateSource,
        ...(styles.length > 0 ? { styles } : {}),
        details: details.trim() || undefined,
      });
    },
    onSuccess: (result, variables) => {
      if (result?.generationId) {
        setGenerationSelection({
          projectId: variables.projectId,
          generationId: result.generationId,
        });
        void queryClient.invalidateQueries({
          queryKey: ["projects", variables.projectId],
        });
      }
      const count = styles.length;
      toast(
        count > 0
          ? `Generating a redesign in ${count} ${count === 1 ? "style" : "styles"}…`
          : "Generating your redesign…",
      );
    },
    onError: (error) =>
      toast.error(
        error instanceof Error ? error.message : "Couldn't start the redesign",
      ),
  });

  function generate() {
    if (!source || !projectId) return;
    mutation.mutate({ projectId, source });
  }

  return {
    roomTypeId,
    source,
    onSourceChange,
    styles,
    setStyles,
    details,
    setDetails,
    canGenerate: source !== null,
    isGenerating: mutation.isPending,
    generate,
    generationId,
    selectGeneration: (nextGenerationId) =>
      setGenerationSelection({ projectId, generationId: nextGenerationId }),
    isProjectLoading: Boolean(projectId) && isProjectLoading,
  };
}
