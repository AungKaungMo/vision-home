import { getAuth } from "@clerk/express";
import type { RequestHandler } from "express";

import { UnauthorizedError } from "@/core/errors";
import { prisma } from "@/database/prisma";

declare global {
  // Express's Request type can only be extended through its global namespace;
  // there's no ES-module equivalent, so the no-namespace rule is disabled here.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const requireUser: RequestHandler = async (request, _response, next) => {
  const { userId: clerkId } = getAuth(request);
  if (!clerkId) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findFirst({
    where: { clerkId, deletedAt: null },
    select: { id: true },
  });
  if (!user) {
    throw new UnauthorizedError("User not found");
  }

  request.userId = user.id;
  next();
};
