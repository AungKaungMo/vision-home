import type { RequestHandler } from "express";

import { success } from "@/core/response";
import {
  getRoomTypeById,
  listRoomTypes,
} from "@/services/room-type.service";

export const handleListRoomTypes: RequestHandler = async (_request, response) => {
  const result = await listRoomTypes();

  response.status(200).json(success(result, "Room types retrieved"));
};

export const handleGetRoomType: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const result = await getRoomTypeById(request.params.id);

  response.status(200).json(success(result, "Room type retrieved"));
};
