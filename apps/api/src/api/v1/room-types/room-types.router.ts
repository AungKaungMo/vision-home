import { Router } from "express";

import {
  handleGetRoomType,
  handleListRoomTypes,
} from "@/api/v1/room-types/room-types.handler";

export const roomTypesRouter = Router();

roomTypesRouter.get("/", handleListRoomTypes);
roomTypesRouter.get("/:id", handleGetRoomType);
