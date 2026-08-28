import { House } from "lucide-react";

export function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-10 place-items-center rounded-full bg-terracotta text-white">
        <House aria-hidden="true" className="size-6" strokeWidth={2.25} />
      </span>
      <span className="font-display text-xl leading-none text-fg-1">
        VisionHome
      </span>
    </div>
  );
}
