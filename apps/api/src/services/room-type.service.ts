import { NotFoundError } from "@/core/errors";
import { r2PublicUrl } from "@/core/storage";
import { prisma } from "@/database/prisma";

const roomTypeSelect = {
  id: true,
  code: true,
  name: true,
  description: true,
  defaultImageKey: true,
  promptHint: true,
  sortOrder: true,
} as const;

type RoomTypeRow = {
  defaultImageKey: string | null;
};

function withImageUrl<T extends RoomTypeRow>(roomType: T) {
  return {
    ...roomType,
    defaultImageUrl: r2PublicUrl(roomType.defaultImageKey),
  };
}

export async function listRoomTypes() {
  // The set is small (tens of rows), so we return everything unpaginated.
  const roomTypes = await prisma.roomType.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
    select: roomTypeSelect,
  });

  return { items: roomTypes.map(withImageUrl) };
}

export async function getRoomTypeById(id: string) {
  const roomType = await prisma.roomType.findFirst({
    where: { id, isActive: true },
    select: roomTypeSelect,
  });

  if (!roomType) {
    throw new NotFoundError("Room type not found");
  }

  return withImageUrl(roomType);
}
