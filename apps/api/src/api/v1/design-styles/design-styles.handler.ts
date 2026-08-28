import type { RequestHandler } from "express";

import { success } from "@/core/response";
import {
  listDesignStyles,
} from "@/services/design-style.service";

export const handleListDesignStyles: RequestHandler = async (
  _request,
  response,
) => {
  const result = await listDesignStyles();

  response.status(200).json(success(result, "Design styles retrieved"));
};
