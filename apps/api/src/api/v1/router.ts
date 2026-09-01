import { Router } from "express";

import { designStylesRouter } from "@/api/v1/design-styles/design-styles.router";
import { generationsRouter } from "@/api/v1/generations/generations.router";
import { projectsRouter } from "@/api/v1/projects/projects.router";
import { roomTypesRouter } from "@/api/v1/room-types/room-types.router";

export const v1Router = Router();

v1Router.use("/room-types", roomTypesRouter);
v1Router.use("/design-styles", designStylesRouter);
v1Router.use("/projects", projectsRouter);
v1Router.use("/generations", generationsRouter);
