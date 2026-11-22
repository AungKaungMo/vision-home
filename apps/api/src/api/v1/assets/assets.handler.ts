import { applyElementEditsSchema } from "@repo/schemas/designs";
import type { RequestHandler } from "express";

import { UnauthorizedError } from "@/core/errors";
import { success } from "@/core/response";
import { parseBody, parseUuidParam } from "@/core/validation";
import { applyElementEdits } from "@/services/element-edit.service";

export const handleApplyElementEdits: RequestHandler<{ id: string }> = async (
  request,
  response,
) => {
  const ownerId = request.userId;
  if (!ownerId) {
    throw new UnauthorizedError();
  }

  const assetId = parseUuidParam(request.params.id, "asset");
  const input = parseBody(applyElementEditsSchema, request.body);
  const result = await applyElementEdits(ownerId, assetId, input);

  response.status(202).json(success(result, "Element edits started"));
};
