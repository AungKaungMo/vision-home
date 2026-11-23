import type { DesignStyle } from "@repo/schemas/design-styles";

import { NotFoundError } from "@/core/errors";
import { prisma } from "@/database/prisma";

const designStyleSelect = {
  id: true,
  code: true,
  name: true,
  promptHint: true,
};

export async function listDesignStyles(): Promise<{ items: DesignStyle[] }> {
  const designStyles = await prisma.designStyle.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
    select: designStyleSelect,
  });

  return { items: designStyles };
}

export async function getDesignStyleById(id: string): Promise<DesignStyle> {
  const designStyle = await prisma.designStyle.findFirst({
    where: { id, isActive: true },
    select: designStyleSelect,
  });

  if (!designStyle) {
    throw new NotFoundError("Design style not found");
  }

  return designStyle;
}
