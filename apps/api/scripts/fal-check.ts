import { falImageGeneration } from "@/adapters/image-generation/fal.adapter";

// A public interior photo to feed as the source room.
const SOURCE =
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1024&q=80";

async function main() {
  console.log("provider:", falImageGeneration.provider);
  console.log("model:", falImageGeneration.modelId);
  console.time("submit");

  const result = await falImageGeneration.submit({
    sourceImageUrl: SOURCE,
    styles: [
      { code: "japandi", promptHint: "warm minimal Japandi, natural wood, neutral tones" },
    ],
    details: "add a few indoor plants and a paper floor lamp",
    roomTypeHint: "living room",
  });

  console.timeEnd("submit");
  console.log("providerRequestId:", result.providerRequestId);
  console.log("styleCode:", result.image.styleCode);
  console.log("image url:", result.image.url);
}

main().catch((error) => {
  console.error("FAILED:", error);
  process.exit(1);
});
