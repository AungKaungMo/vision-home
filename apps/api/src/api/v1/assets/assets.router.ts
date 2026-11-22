import { Router } from "express";

import { requireUser } from "@/api/middleware/auth.middleware";
import { handleApplyElementEdits } from "@/api/v1/assets/assets.handler";

export const assetsRouter = Router();

// Editing a generated render produces a new generation seeded from that asset.
assetsRouter.post("/:id/edits", requireUser, handleApplyElementEdits);
