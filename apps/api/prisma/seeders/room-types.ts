import type { prisma as PrismaClient } from "../../src/database/prisma";

type RoomTypeSeed = {
  code: string;
  name: string;
  description: string;
  sampleImageKeys: string[];
  promptHint: string;
  sortOrder: number;
  isActive: boolean;
};

const roomTypes: RoomTypeSeed[] = [
  {
    code: "living-room",
    name: "Living Room",
    description: "Primary social and relaxation area",
    sampleImageKeys: ["default/room-types/living-room.jpg"],
    promptHint:
      "Residential living room with seating, lighting, storage, focal point and clear circulation",
    sortOrder: 10,
    isActive: true,
  },
  {
    code: "family-room",
    name: "Family Room",
    description: "Casual shared space for daily family activities",
    sampleImageKeys: ["default/room-types/family-room.avif"],
    promptHint:
      "Comfortable family room with durable seating, entertainment area, storage and open circulation",
    sortOrder: 20,
    isActive: true,
  },
  {
    code: "bedroom",
    name: "Bedroom",
    description: "General sleeping and personal relaxation space",
    sampleImageKeys: ["default/room-types/bedroom.webp"],
    promptHint:
      "Comfortable bedroom with bed, bedside storage, wardrobe, lighting and restful circulation",
    sortOrder: 30,
    isActive: true,
  },
  {
    code: "primary-bedroom",
    name: "Primary Bedroom",
    description: "Main bedroom with additional comfort and storage",
    sampleImageKeys: ["default/room-types/primary-bedroom.jpg"],
    promptHint:
      "Spacious primary bedroom with large bed, bedside tables, wardrobe, seating and layered lighting",
    sortOrder: 40,
    isActive: true,
  },
  {
    code: "guest-bedroom",
    name: "Guest Bedroom",
    description: "Bedroom prepared for temporary guests",
    sampleImageKeys: ["default/room-types/guest-bedroom.webp"],
    promptHint:
      "Welcoming guest bedroom with bed, compact storage, bedside lighting and practical circulation",
    sortOrder: 50,
    isActive: true,
  },
  {
    code: "kids-bedroom",
    name: "Kids Bedroom",
    description: "Sleeping, storage and activity space for children",
    sampleImageKeys: ["default/room-types/kids-bedroom.webp"],
    promptHint:
      "Safe kids bedroom with bed, toy storage, study area, soft lighting and open play space",
    sortOrder: 60,
    isActive: true,
  },
  {
    code: "nursery",
    name: "Nursery",
    description: "Room designed for a baby and caregiver",
    sampleImageKeys: ["default/room-types/nursery.webp"],
    promptHint:
      "Safe nursery with crib, changing area, closed storage, caregiver seating and soft lighting",
    sortOrder: 70,
    isActive: true,
  },
  {
    code: "kitchen",
    name: "Kitchen",
    description: "Food preparation, cooking and kitchen storage area",
    sampleImageKeys: ["default/room-types/kitchen.webp"],
    promptHint:
      "Functional residential kitchen with work triangle, countertops, cabinetry, appliances and task lighting",
    sortOrder: 80,
    isActive: true,
  },
  {
    code: "dining-room",
    name: "Dining Room",
    description: "Dedicated area for meals and gatherings",
    sampleImageKeys: ["default/room-types/dining-room.jpg"],
    promptHint:
      "Dining room with appropriately sized table, comfortable chairs, lighting and serving circulation",
    sortOrder: 90,
    isActive: true,
  },
  {
    code: "open-plan-living",
    name: "Open-plan Living",
    description: "Combined living, dining and kitchen space",
    sampleImageKeys: ["default/room-types/open-plan-living.webp"],
    promptHint:
      "Open-plan living space with coordinated kitchen, dining and seating zones with clear visual separation",
    sortOrder: 100,
    isActive: true,
  },
  {
    code: "bathroom",
    name: "Bathroom",
    description: "Full personal hygiene space with bathing facilities",
    sampleImageKeys: ["default/room-types/bathroom.jpg"],
    promptHint:
      "Functional bathroom with vanity, toilet, shower or bath, moisture-resistant materials and practical lighting",
    sortOrder: 110,
    isActive: true,
  },
  {
    code: "powder-room",
    name: "Powder Room",
    description: "Small guest toilet and washbasin space",
    sampleImageKeys: ["default/room-types/powder-room.jpeg"],
    promptHint:
      "Compact powder room with toilet, washbasin, mirror, storage and flattering lighting",
    sortOrder: 120,
    isActive: true,
  },
  {
    code: "home-office",
    name: "Home Office",
    description: "Dedicated professional work area",
    sampleImageKeys: ["default/room-types/home-office.webp"],
    promptHint:
      "Productive home office with ergonomic desk, task chair, storage, lighting and video-call background",
    sortOrder: 130,
    isActive: true,
  },
  {
    code: "study-room",
    name: "Study Room",
    description: "Quiet space for studying and focused work",
    sampleImageKeys: ["default/room-types/study-room.webp"],
    promptHint:
      "Quiet study room with desk, comfortable chair, bookshelves, task lighting and minimal distractions",
    sortOrder: 140,
    isActive: true,
  },
  {
    code: "home-library",
    name: "Home Library",
    description: "Reading and book storage room",
    sampleImageKeys: ["default/room-types/home-library.jpeg"],
    promptHint:
      "Home library with accessible bookshelves, reading seating, warm lighting and organized circulation",
    sortOrder: 150,
    isActive: true,
  },
  {
    code: "walk-in-closet",
    name: "Walk-in Closet",
    description: "Walk-in clothing and accessory storage",
    sampleImageKeys: ["default/room-types/walk-in-closet.jpg"],
    promptHint:
      "Organized walk-in closet with hanging zones, drawers, shelving, mirror and even lighting",
    sortOrder: 210,
    isActive: true,
  },
  {
    code: "media-room",
    name: "Media Room",
    description: "Entertainment space focused on television or cinema",
    sampleImageKeys: ["default/room-types/media-room.webp"],
    promptHint:
      "Media room with screen-focused seating, controlled lighting, acoustic treatment and equipment storage",
    sortOrder: 230,
    isActive: true,
  },
  {
    code: "game-room",
    name: "Game Room",
    description: "Recreational room for games and group activities",
    sampleImageKeys: ["default/room-types/game-room.webp"],
    promptHint:
      "Flexible game room with activity zones, comfortable seating, equipment storage and durable surfaces",
    sortOrder: 240,
    isActive: true,
  },
  {
    code: "home-gym",
    name: "Home Gym",
    description: "Personal exercise and fitness room",
    sampleImageKeys: ["default/room-types/home-gym.jpg"],
    promptHint:
      "Safe home gym with equipment zones, durable flooring, ventilation, mirrors and clear movement space",
    sortOrder: 250,
    isActive: true,
  },
  {
    code: "balcony",
    name: "Balcony",
    description: "Small elevated outdoor space",
    sampleImageKeys: ["default/room-types/balcony.webp"],
    promptHint:
      "Compact balcony with weather-resistant seating, planters, lighting and unobstructed access",
    sortOrder: 260,
    isActive: true,
  },
  {
    code: "patio",
    name: "Patio",
    description: "Ground-level outdoor living area",
    sampleImageKeys: ["default/room-types/patio.jpeg"],
    promptHint:
      "Outdoor patio with weather-resistant furniture, shade, lighting, planting and practical circulation",
    sortOrder: 270,
    isActive: true,
  },
  {
    code: "terrace",
    name: "Terrace",
    description: "Larger elevated outdoor living area",
    sampleImageKeys: ["default/room-types/terrace.avif"],
    promptHint:
      "Open terrace with seating zones, weather protection, planters, lighting and entertaining space",
    sortOrder: 280,
    isActive: true,
  },
  {
    code: "basement",
    name: "Basement",
    description: "Below-ground flexible residential space",
    sampleImageKeys: ["default/room-types/basement.webp"],
    promptHint:
      "Finished basement with functional zones, moisture-aware materials, storage and effective lighting",
    sortOrder: 310,
    isActive: true,
  },
  {
    code: "attic",
    name: "Attic",
    description: "Upper-level space beneath the roof",
    sampleImageKeys: ["default/room-types/attic.jpeg"],
    promptHint:
      "Usable attic space respecting roof slopes with compact storage, safe circulation and effective lighting",
    sortOrder: 320,
    isActive: true,
  },
  {
    code: "studio",
    name: "Studio",
    description: "Combined living, sleeping and kitchen space in one room",
    promptHint:
      "Compact studio apartment with defined sleeping, living and kitchen zones and clear circulation",
    sortOrder: 165,
    isActive: true,
    sampleImageKeys: [],
  },
  {
    code: "entryway",
    name: "Entryway",
    description: "Entrance and transition space into the home",
    promptHint:
      "Welcoming entryway with storage for shoes and coats, seating, mirror and clear circulation",
    sortOrder: 200,
    isActive: true,
    sampleImageKeys: [],
  },
  {
    code: "laundry-room",
    name: "Laundry Room",
    description: "Dedicated space for washing and drying",
    promptHint:
      "Practical laundry room with washer, dryer, folding counter, storage and utility sink",
    sortOrder: 290,
    isActive: true,
    sampleImageKeys: [],
  },
  {
    code: "mudroom",
    name: "Mudroom",
    description: "Utility transition space for gear and storage",
    promptHint:
      "Hardworking mudroom with benches, hooks, cubbies and durable, easy-clean surfaces",
    sortOrder: 295,
    isActive: true,
    sampleImageKeys: [],
  },
  {
    code: "sunroom",
    name: "Sunroom",
    description: "Bright glazed room for relaxing and plants",
    promptHint:
      "Light-filled sunroom with comfortable seating, plants, sun-tolerant materials and garden views",
    sortOrder: 300,
    isActive: true,
    sampleImageKeys: [],
  },
  {
    code: "garage",
    name: "Garage",
    description: "Vehicle storage and utility workspace",
    promptHint:
      "Organized garage with vehicle space, wall storage, workbench and durable flooring",
    sortOrder: 330,
    isActive: true,
    sampleImageKeys: [],
  },
];

export async function seedRoomTypes(prisma: typeof PrismaClient) {
  console.log(`Seeding ${roomTypes.length} room types...`);

  for (const roomType of roomTypes) {
    await prisma.roomType.upsert({
      where: { code: roomType.code },
      create: roomType,
      update: roomType,
    });
  }

  console.log(`Seeded ${roomTypes.length} room types.`);
}
