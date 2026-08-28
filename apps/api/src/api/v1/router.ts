import { Router } from "express";

import { designStylesRouter } from "@/api/v1/design-styles/design-styles.router";
import { roomTypesRouter } from "@/api/v1/room-types/room-types.router";

export const v1Router = Router();

v1Router.use("/room-types", roomTypesRouter);
v1Router.use("/design-styles", designStylesRouter);
