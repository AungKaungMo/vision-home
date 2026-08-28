import type { prisma as PrismaClient } from "../../src/database/prisma";

type DesignStyleSeed = {
  code: string;
  name: string;
  promptHint: string;
  isActive: boolean;
};

const designStyles: DesignStyleSeed[] = [
  {
    code: "modern",
    name: "Modern",
    promptHint:
      "Modern interior with clean lines, neutral palette, minimal ornamentation, smooth surfaces and functional furniture",
    isActive: true,
  },
  {
    code: "contemporary",
    name: "Contemporary",
    promptHint:
      "Contemporary interior with current trends, soft curves, neutral tones, layered textures and statement lighting",
    isActive: true,
  },
  {
    code: "minimalist",
    name: "Minimalist",
    promptHint:
      "Minimalist interior with bare essentials, monochrome palette, hidden storage, open space and few decorative objects",
    isActive: true,
  },
  {
    code: "scandinavian",
    name: "Scandinavian",
    promptHint:
      "Scandinavian interior with light wood, white walls, cozy textiles, functional furniture and abundant natural light",
    isActive: true,
  },
  {
    code: "japandi",
    name: "Japandi",
    promptHint:
      "Japandi interior blending Japanese and Scandinavian design with natural wood, muted earthy palette, low furniture, handcrafted objects and calm minimalism",
    isActive: true,
  },
  {
    code: "earthy",
    name: "Earthy",
    promptHint:
      "Earthy interior with warm terracotta and brown tones, natural materials like wood, stone, jute and clay, and abundant indoor greenery",
    isActive: true,
  },
  {
    code: "industrial",
    name: "Industrial",
    promptHint:
      "Industrial interior with exposed brick, concrete, ductwork, black metal, reclaimed wood and Edison-style lighting",
    isActive: true,
  },
  {
    code: "mid-century-modern",
    name: "Mid-Century Modern",
    promptHint:
      "Mid-century modern interior with tapered wood legs, organic curves, warm walnut tones, bold accent colors and retro geometric patterns",
    isActive: true,
  },
  {
    code: "bohemian",
    name: "Bohemian",
    promptHint:
      "Bohemian interior with eclectic layered textiles, global patterns, rattan, macrame, plants and a warm mix of colors",
    isActive: true,
  },
  {
    code: "coastal",
    name: "Coastal",
    promptHint:
      "Coastal interior with airy light-filled space, white and blue palette, natural fibers, weathered wood and breezy linen textiles",
    isActive: true,
  },
  {
    code: "farmhouse",
    name: "Farmhouse",
    promptHint:
      "Farmhouse interior with shiplap walls, reclaimed wood, vintage accents, apron sink, neutral palette and cozy rustic charm",
    isActive: true,
  },
  {
    code: "traditional",
    name: "Traditional",
    promptHint:
      "Traditional interior with classic symmetry, rich dark woods, ornate detailing, upholstered furniture and layered warm palette",
    isActive: true,
  },
  {
    code: "transitional",
    name: "Transitional",
    promptHint:
      "Transitional interior balancing traditional and modern elements with neutral palette, clean-lined classic furniture and subtle textures",
    isActive: true,
  },
  {
    code: "art-deco",
    name: "Art Deco",
    promptHint:
      "Art deco interior with bold geometric patterns, rich jewel tones, brass and gold accents, mirrored surfaces and luxurious velvet",
    isActive: true,
  },
  {
    code: "rustic",
    name: "Rustic",
    promptHint:
      "Rustic interior with rough-hewn wood, stone, exposed beams, natural textures, earthy tones and handcrafted furniture",
    isActive: true,
  },
  {
    code: "mediterranean",
    name: "Mediterranean",
    promptHint:
      "Mediterranean interior with warm plaster walls, terracotta tiles, arched openings, wrought iron and sun-washed earthy tones",
    isActive: true,
  },
  {
    code: "wabi-sabi",
    name: "Wabi-Sabi",
    promptHint:
      "Wabi-sabi interior celebrating imperfect beauty with raw natural materials, aged textures, muted earthy palette, handmade objects and quiet simplicity",
    isActive: true,
  },
  {
    code: "maximalist",
    name: "Maximalist",
    promptHint:
      "Maximalist interior with bold saturated colors, layered patterns, gallery walls, eclectic collections and curated abundance",
    isActive: true,
  },
];

export async function seedDesignStyles(prisma: typeof PrismaClient) {
  console.log(`Seeding ${designStyles.length} design styles...`);

  for (const designStyle of designStyles) {
    await prisma.designStyle.upsert({
      where: { code: designStyle.code },
      create: designStyle,
      update: designStyle,
    });
  }

  console.log(`Seeded ${designStyles.length} design styles.`);
}
