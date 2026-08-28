import { PrismaPg } from "@prisma/adapter-pg";

import { CONFIG } from "@/core/config";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: CONFIG.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
