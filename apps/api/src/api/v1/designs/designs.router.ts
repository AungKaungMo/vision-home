import { Router } from "express";

import { requireUser } from "@/api/middleware/auth.middleware";
import { uploadSourceImage } from "@/api/middleware/upload.middleware";
import {
  handleCreateDesign,
  handleDeleteDesign,
  handleFavoriteDesign,
  handleGenerateDesign,
  handleGetDesign,
  handleListDesigns,
  handleRestoreDesign,
  handleSourceUpload,
  handleTrashDesign,
} from "@/api/v1/designs/designs.handler";

export const designsRouter = Router();

designsRouter.get("/", requireUser, handleListDesigns);
designsRouter.post("/", requireUser, handleCreateDesign);
designsRouter.get("/:id", requireUser, handleGetDesign);
designsRouter.put("/:id/favorite", requireUser, handleFavoriteDesign);
designsRouter.delete("/:id/favorite", requireUser, handleFavoriteDesign);
designsRouter.post("/:id/trash", requireUser, handleTrashDesign);
designsRouter.post("/:id/restore", requireUser, handleRestoreDesign);
designsRouter.delete("/:id", requireUser, handleDeleteDesign);
designsRouter.post(
  "/:id/assets/upload",
  requireUser,
  uploadSourceImage,
  handleSourceUpload,
);
designsRouter.post("/:id/generate", requireUser, handleGenerateDesign);
