import { Router } from "express";

import { requireUser } from "@/api/middleware/auth.middleware";
import {
  handleGetGeneration,
  handleGetGenerationProducts,
  handleRegenerateGeneration,
} from "@/api/v1/generations/generations.handler";

export const generationsRouter = Router();

generationsRouter.get("/:id", requireUser, handleGetGeneration);
generationsRouter.get(
  "/:id/products",
  requireUser,
  handleGetGenerationProducts,
);
generationsRouter.post(
  "/:id/regenerate",
  requireUser,
  handleRegenerateGeneration,
);
