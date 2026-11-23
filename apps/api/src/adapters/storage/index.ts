import { CONFIG } from "@/core/config";
import type { StoragePort } from "@/ports/storage.port";

import { fakeStorage } from "@/adapters/storage/fake.adapter";
import { r2Storage } from "@/adapters/storage/r2.adapter";

export const storage: StoragePort = CONFIG.USE_FAKE_ADAPTERS
  ? fakeStorage
  : r2Storage;
