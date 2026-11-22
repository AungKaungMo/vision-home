export type CatalogCategory =
  | "Seating"
  | "Tables"
  | "Lighting"
  | "Rugs"
  | "Decor"
  | "Plants";

export type CatalogItem = {
  id: string;
  name: string;
  category: CatalogCategory;
  price: string;
  imageUrl: string;
};

/**
 * A catalog item dropped onto the room. Position + size are normalized (0–1)
 * relative to the room canvas — the same convention as the element-edit regions,
 * so the eventual AI-composite step can consume these boxes directly.
 */
export type PlacedItem = {
  id: string; // per-instance id (an item can be placed more than once)
  catalogId: string;
  name: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  "Seating",
  "Tables",
  "Lighting",
  "Rugs",
  "Decor",
  "Plants",
];

// Placeholder catalog for the UI prototype. Real items would be cut-out PNGs
// (transparent background) so they composite cleanly; these Unsplash photos are
// stand-ins for layout/interaction work.
export const CATALOG: CatalogItem[] = [
  {
    id: "linen-lounge-chair",
    name: "Linen Lounge Chair",
    category: "Seating",
    price: "$640",
    imageUrl:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "boucle-armchair",
    name: "Bouclé Armchair",
    category: "Seating",
    price: "$520",
    imageUrl:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "travertine-coffee-table",
    name: "Travertine Coffee Table",
    category: "Tables",
    price: "$1,140",
    imageUrl:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "oak-side-table",
    name: "Oak Side Table",
    category: "Tables",
    price: "$320",
    imageUrl:
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "paper-floor-lamp",
    name: "Paper Floor Lamp",
    category: "Lighting",
    price: "$280",
    imageUrl:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "wool-area-rug",
    name: "Hand-woven Wool Rug",
    category: "Rugs",
    price: "$460",
    imageUrl:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "ceramic-vase-set",
    name: "Ceramic Vase Set",
    category: "Decor",
    price: "$95",
    imageUrl:
      "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "monstera-large",
    name: "Monstera, Large",
    category: "Plants",
    price: "$78",
    imageUrl:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80",
  },
];
