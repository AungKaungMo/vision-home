import {
  createProjectSchema,
  generateDesignSchema,
} from "@repo/schemas/projects";
import type { RequestHandler } from "express";

import { BadRequestError, UnauthorizedError } from "@/core/errors";
import { success } from "@/core/response";
import { parseBody, parseUuidParam } from "@/core/validation";
import {
  createProject,
  generateDesign,
  getProjectById,
  listProjects,
  storeSourceUpload,
} from "@/services/project.service";

export const handleListProjects: RequestHandler = async (request, response) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const result = await listProjects(ownerId);

  response.status(200).json(success(result, "Projects retrieved"));
};

export const handleCreateProject: RequestHandler = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const input = parseBody(createProjectSchema, request.body);
  const project = await createProject(ownerId, input);

  response.status(201).json(success(project, "Project created"));
};

export const handleGetProject: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const projectId = parseUuidParam(request.params.id, "project");
  const project = await getProjectById(ownerId, projectId);

  response.status(200).json(success(project, "Project retrieved"));
};

export const handleSourceUpload: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const projectId = parseUuidParam(request.params.id, "project");
  if (!request.file) {
    throw new BadRequestError("Image file is required");
  }
  const result = await storeSourceUpload(
    ownerId,
    projectId,
    request.file.buffer,
  );

  response.status(201).json(success(result, "Source image uploaded"));
};

export const handleGenerateDesign: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const projectId = parseUuidParam(request.params.id, "project");
  const input = parseBody(generateDesignSchema, request.body);
  const result = await generateDesign(ownerId, projectId, input);

  response.status(202).json(success(result, "Redesign started"));
};
