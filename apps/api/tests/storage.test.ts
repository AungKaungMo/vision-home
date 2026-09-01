import assert from "node:assert/strict";
import test from "node:test";

import { mimeForImageType } from "../src/core/image-mime.js";

test("recognizes AVIF images", () => {
  assert.equal(mimeForImageType("avif"), "image/avif");
});

test("normalizes JPEG image types", () => {
  assert.equal(mimeForImageType("jpg"), "image/jpeg");
  assert.equal(mimeForImageType("jpeg"), "image/jpeg");
});
