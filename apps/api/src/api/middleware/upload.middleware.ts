import multer from "multer";
import type { RequestHandler } from "express";
import { IMAGE_MIME_TYPES, MAX_UPLOAD_BYTES } from "@repo/schemas/designs";

import { BadRequestError } from "@/core/errors";

const acceptedMimeTypes = new Set<string>(IMAGE_MIME_TYPES);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!acceptedMimeTypes.has(file.mimetype)) {
      callback(new BadRequestError("Upload a JPEG, PNG, or WebP image"));
      return;
    }
    callback(null, true);
  },
}).single("file");

export const uploadSourceImage: RequestHandler = (request, response, next) => {
  upload(request, response, (error) => {
    if (!error) {
      next();
      return;
    }
    if (
      error instanceof multer.MulterError &&
      error.code === "LIMIT_FILE_SIZE"
    ) {
      next(new BadRequestError("Uploaded photo is too large"));
      return;
    }
    next(
      error instanceof BadRequestError
        ? error
        : new BadRequestError("Invalid image upload"),
    );
  });
};
