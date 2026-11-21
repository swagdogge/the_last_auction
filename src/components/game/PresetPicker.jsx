import { DEMO_PRESETS } from "@/lib/demo-presets";
import { cn } from "@/lib/utils";

export default function PresetPicker({ selectedId, onPick }) {
  return (
    <div className="rounded-sm border border-white/15 bg-black/60 p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-foreground/50">Demo mode</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Pick this round's work
        </p>
      </div>

      <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-foreground/70">
        Six finished works from the estate. Choose one and it goes to the saleroom as if you had
        painted it. The bidders' reactions are already recorded.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DEMO_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPick(preset)}
            aria-pressed={selectedId === preset.id}
            className={cn(
              "overflow-hidden rounded-sm border bg-black/40 text-left transition-all",
              selectedId === preset.id
                ? "border-primary shadow-[3px_3px_0_0_hsl(0_0%_100%/0.3)]"
                : "border-white/15 hover:border-white/40",
            )}
          >
            <img
              src={preset.url}
              alt={preset.title}
              className="aspect-[3/4] w-full object-cover"
            />
            <div className="px-2.5 py-2">
              <p className="font-heading text-[13px] leading-tight">{preset.title}</p>
              <p className="mt-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                {preset.medium}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}