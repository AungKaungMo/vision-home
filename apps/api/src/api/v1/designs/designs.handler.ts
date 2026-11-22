import {
  createDesignSchema,
  generateDesignSchema,
} from "@repo/schemas/designs";
import type { RequestHandler } from "express";

import { BadRequestError, UnauthorizedError } from "@/core/errors";
import { success } from "@/core/response";
import { parseBody, parseUuidParam } from "@/core/validation";
import {
  createDesign,
  deleteDesign,
  generateDesign,
  getDesignById,
  listDesigns,
  restoreDesign,
  setDesignFavorite,
  storeSourceUpload,
  trashDesign,
} from "@/services/design.service";

export const handleListDesigns: RequestHandler = async (request, response) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const result = await listDesigns(ownerId);

  response.status(200).json(success(result, "Designs retrieved"));
};

export const handleCreateDesign: RequestHandler = async (request, response) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const input = parseBody(createDesignSchema, request.body);
  const design = await createDesign(ownerId, input);

  response.status(201).json(success(design, "Design created"));
};

export const handleGetDesign: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const designId = parseUuidParam(request.params.id, "design");
  const design = await getDesignById(ownerId, designId);

  response.status(200).json(success(design, "Design retrieved"));
};

/**
 * Star (PUT) / unstar (DELETE) a design. The two verbs share one handler so the
 * favorite state is derived from the method rather than a body flag.
 */
export const handleFavoriteDesign: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const designId = parseUuidParam(request.params.id, "design");
  const isFavorite = request.method === "PUT";
  await setDesignFavorite(ownerId, designId, isFavorite);

  response
    .status(200)
    .json(success({ id: designId, isFavorite }, "Design favorite updated"));
};

export const handleTrashDesign: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const designId = parseUuidParam(request.params.id, "design");
  await trashDesign(ownerId, designId);

  response.status(200).json(success({ id: designId }, "Design moved to trash"));
};

export const handleRestoreDesign: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const designId = parseUuidParam(request.params.id, "design");
  await restoreDesign(ownerId, designId);

  response.status(200).json(success({ id: designId }, "Design restored"));
};

export const handleDeleteDesign: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const designId = parseUuidParam(request.params.id, "design");
  await deleteDesign(ownerId, designId);

  response.status(200).json(success({ id: designId }, "Design deleted"));
};

export const handleSourceUpload: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const designId = parseUuidParam(request.params.id, "design");
  if (!request.file) {
    throw new BadRequestError("Image file is required");
  }
  const result = await storeSourceUpload(ownerId, designId, request.file.buffer);

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

  const designId = parseUuidParam(request.params.id, "design");
  const input = parseBody(generateDesignSchema, request.body);
  const result = await generateDesign(ownerId, designId, input);

  response.status(202).json(success(result, "Redesign started"));
};
