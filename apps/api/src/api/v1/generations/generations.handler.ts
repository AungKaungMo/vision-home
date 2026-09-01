import type { RequestHandler } from "express";

import { UnauthorizedError } from "@/core/errors";
import { success } from "@/core/response";
import { parseUuidParam } from "@/core/validation";
import {
  getGenerationById,
  regenerateGeneration,
} from "@/services/generation.service";

export const handleGetGeneration: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const generationId = parseUuidParam(request.params.id, "generation");
  const generation = await getGenerationById(ownerId, generationId);

  response.status(200).json(success(generation, "Generation retrieved"));
};

export const handleRegenerateGeneration: RequestHandler<{
  id: string;
}> = async (request, response) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const generationId = parseUuidParam(request.params.id, "generation");
  const result = await regenerateGeneration(ownerId, generationId);

  response.status(202).json(success(result, "Regeneration started"));
};
