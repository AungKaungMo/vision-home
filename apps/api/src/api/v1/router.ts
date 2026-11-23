import { Router } from "express";

import { assetsRouter } from "@/api/v1/assets/assets.router";
import { designStylesRouter } from "@/api/v1/design-styles/design-styles.router";
import { designsRouter } from "@/api/v1/designs/designs.router";
import { generationsRouter } from "@/api/v1/generations/generations.router";
import { roomTypesRouter } from "@/api/v1/room-types/room-types.router";

export const v1Router = Router();

v1Router.use("/room-types", roomTypesRouter);
v1Router.use("/design-styles", designStylesRouter);
v1Router.use("/designs", designsRouter);
v1Router.use("/generations", generationsRouter);
v1Router.use("/assets", assetsRouter);
