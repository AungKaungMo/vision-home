import { falImageUnderstanding } from "@/adapters/image-understanding/fal.adapter";

const CASES: { label: string; url: string; expectOk: boolean }[] = [
  {
    label: "living room",
    url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1024&q=80",
    expectOk: true,
  },
  {
    label: "bedroom",
    url: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=1024&q=80",
    expectOk: true,
  },
  {
    label: "cat",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1024&q=80",
    expectOk: false,
  },
  {
    label: "person",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1024&q=80",
    expectOk: false,
  },
];

async function main() {
  let failures = 0;
  for (const { label, url, expectOk } of CASES) {
    const result = await falImageUnderstanding.isInteriorRoom(url);
    const pass = result.ok === expectOk;
    if (!pass) failures += 1;
    console.log(
      `${pass ? "PASS" : "FAIL"}  ${label.padEnd(12)} ok=${result.ok} (expected ${expectOk})`,
    );
  }
  console.log(failures === 0 ? "\nAll detection cases passed." : `\n${failures} failed.`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error("FAILED:", error);
  process.exit(1);
});
