import { Router } from "express";
import type { Request } from "express";

import { devStorage } from "@/adapters/storage/fake.adapter";

export const devStorageRouter = Router();

// Express 5 wildcard params are arrays; storage keys remain slash-delimited.
function keyOf(request: Request): string {
  const splat = (request.params as Record<string, string | string[]>).splat;
  return Array.isArray(splat) ? splat.join("/") : (splat ?? "");
}

devStorageRouter.get("/{*splat}", async (request, response) => {
  const object = await devStorage.get(keyOf(request));
  if (!object) {
    response.status(404).json({ error: "Not found" });
    return;
  }
  response.setHeader("Content-Type", object.contentType);
  response.send(object.body);
});
