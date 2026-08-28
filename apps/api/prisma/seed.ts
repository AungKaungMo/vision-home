import { prisma } from "../src/database/prisma";

import { seedDesignStyles } from "./seeders/design-styles";
import { seedRoomTypes } from "./seeders/room-types";

async function main() {
  await seedRoomTypes(prisma);
  await seedDesignStyles(prisma);
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
