import { Router } from "express";

import {
  handleListDesignStyles,
} from "@/api/v1/design-styles/design-styles.handler";

export const designStylesRouter = Router();

designStylesRouter.get("/", handleListDesignStyles);
