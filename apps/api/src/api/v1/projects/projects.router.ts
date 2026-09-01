import { Router } from "express";

import { requireUser } from "@/api/middleware/auth.middleware";
import { uploadSourceImage } from "@/api/middleware/upload.middleware";
import {
  handleCreateProject,
  handleGenerateDesign,
  handleGetProject,
  handleListProjects,
  handleSourceUpload,
} from "@/api/v1/projects/projects.handler";

export const projectsRouter = Router();

projectsRouter.get("/", requireUser, handleListProjects);
projectsRouter.post("/", requireUser, handleCreateProject);
projectsRouter.get("/:id", requireUser, handleGetProject);
projectsRouter.post(
  "/:id/assets/upload",
  requireUser,
  uploadSourceImage,
  handleSourceUpload,
);
projectsRouter.post("/:id/generate", requireUser, handleGenerateDesign);
