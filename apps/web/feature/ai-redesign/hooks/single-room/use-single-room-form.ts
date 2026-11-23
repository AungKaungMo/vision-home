"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GenerateSource } from "@repo/schemas/designs";

import {
  DEFAULT_ROOM_STYLE,
  designDetailHref,
  type PhotoSource,
} from "@/feature/ai-redesign/constants";
import {
  createDesign,
  generateDesign,
  uploadSourceImage,
} from "@/feature/ai-redesign/api/designs";
import { useDesign } from "@/feature/ai-redesign/hooks/queries/use-design";

async function buildGenerateSource(
  designId: string,
  source: PhotoSource,
): Promise<GenerateSource> {
  if (source.kind === "sample") {
    return { kind: "sample", id: source.id, imageUrl: source.imageUrl };
  }

  const uploaded = await uploadSourceImage(designId, source.file);

  return {
    kind: "upload",
    ...uploaded,
  };
}

/**
 * The gallery opens the single-room form with no design yet, so the first
 * generation creates one on the fly. A short, dated title keeps the gallery
 * readable until proper naming exists.
 */
function defaultDesignName(): string {
  const date = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `Single room · ${date}`;
}

export type UseSingleRoomForm = {
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
  isDesignLoading: boolean;
};

export function useSingleRoomForm(designIdProp?: string): UseSingleRoomForm {
  const router = useRouter();
  const queryClient = useQueryClient();

  // When the form is opened without a design (the "Create New Design" entry
  // point), the first generation creates one; its id is held here and reflected
  // in the URL so a refresh keeps the same design.
  const [createdDesignId, setCreatedDesignId] = useState<string | undefined>(
    undefined,
  );
  const designId = designIdProp ?? createdDesignId;

  const { data: design, isLoading: isDesignLoading } = useDesign(designId);

  const [source, setSource] = useState<PhotoSource | null>(null);
  const [styles, setStyles] = useState<string[]>([DEFAULT_ROOM_STYLE]);
  const [details, setDetails] = useState("");
  const [generationSelection, setGenerationSelection] = useState<{
    designId: string | undefined;
    generationId: string | null;
  } | null>(null);
  const generationId =
    generationSelection !== null && generationSelection.designId === designId
      ? generationSelection.generationId
      : (design?.latestGenerationId ?? null);

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
    mutationFn: async ({ source }: { source: PhotoSource }) => {
      // A chosen sample implies its room type — carry it onto the design so the
      // backend can validate the sample and the AI gets the room-type hint.
      const roomTypeId =
        design?.room?.roomTypeId ??
        (source.kind === "sample" ? source.roomTypeId : undefined);

      let id = designId;
      if (!id) {
        const created = await createDesign({
          name: defaultDesignName(),
          type: "single_room",
          ...(roomTypeId ? { roomTypeId } : {}),
        });
        if (!created) throw new Error("Couldn't create the design");
        id = created.id;
      }

      const generateSource = await buildGenerateSource(id, source);
      const result = await generateDesign(id, {
        source: generateSource,
        ...(styles.length > 0 ? { styles } : {}),
        details: details.trim() || undefined,
      });

      return { designId: id, result };
    },
    onSuccess: ({ designId: id, result }) => {
      // A design created here is only known client-side — persist it to the URL
      // so polling, refetch, and a refresh all resolve the same design.
      if (!designIdProp && id !== designId) {
        setCreatedDesignId(id);
        router.replace(designDetailHref(id), { scroll: false });
      }

      if (result?.generationId) {
        setGenerationSelection({
          designId: id,
          generationId: result.generationId,
        });
      }
      void queryClient.invalidateQueries({ queryKey: ["designs"] });

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
    if (!source) return;
    mutation.mutate({ source });
  }

  return {
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
      setGenerationSelection({ designId, generationId: nextGenerationId }),
    isDesignLoading: Boolean(designId) && isDesignLoading,
  };
}
