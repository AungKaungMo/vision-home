import type {
  RoomTypeDetail,
  RoomTypeListItem,
} from "@repo/schemas/room-types";

import { NotFoundError } from "@/core/errors";
import { catalogPublicUrl } from "@/core/storage";
import { prisma } from "@/database/prisma";

export async function listRoomTypes(): Promise<{ items: RoomTypeListItem[] }> {
  // The set is small (tens of rows), so we return everything unpaginated.
  const roomTypes = await prisma.roomType.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
    select: { id: true, name: true, sampleImageKeys: true },
  });

  return {
    items: roomTypes.map(({ sampleImageKeys, ...rest }) => ({
      ...rest,
      samples: sampleImageKeys
        .map((key) => catalogPublicUrl(key))
        .filter((url): url is string => url !== null),
    })),
  };
}

export async function getRoomTypeById(id: string): Promise<RoomTypeDetail> {
  const roomType = await prisma.roomType.findFirst({
    where: { id, isActive: true },
    select: { id: true, name: true, promptHint: true, sampleImageKeys: true },
  });

  if (!roomType) {
    throw new NotFoundError("Room type not found");
  }

  const { sampleImageKeys, ...rest } = roomType;

  return {
    ...rest,
    samples: sampleImageKeys
      .map((key) => catalogPublicUrl(key))
      .filter((url): url is string => url !== null),
  };
}
