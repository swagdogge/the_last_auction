import { useState } from "react";
import {
  BRUSH_SIZES,
  CANVAS_W,
  FALLBACK_CANVAS_WIDTH,
  opacityFromTransparency,
  ROLLER_HEIGHT,
  STUDIO_TOOLS,
  previewWidth,
  strokeWidth,
} from "@/lib/studio-tools";
import {
  BrushGlyph,
  BucketGlyph,
  ClearGlyph,
  FineBrushGlyph,
  RollerGlyph,
  SprayGlyph,
  UndoGlyph,
} from "@/components/game/StudioGlyphs";
import { cn } from "@/lib/utils";

const TILE = "flex items-center justify-center rounded-sm border-2 transition-all";
const OFF = "border-white/25 bg-black/35 hover:border-white/60 text-foreground/80";
const ON =
  "border-white bg-white/90 text-[#141414] shadow-[3px_3px_0_0_rgba(0,0,0,0.55)]";

const GLYPHS = {
  brush: BrushGlyph,
  fine: FineBrushGlyph,
  spray: SprayGlyph,
  roller: RollerGlyph,
};

function SizePreview({ tool, size, canvasWidth }) {
  const scale = (canvasWidth || FALLBACK_CANVAS_WIDTH) / CANVAS_W;
  const px = Math.max(2, previewWidth(tool, size, canvasWidth || FALLBACK_CANVAS_WIDTH));
  const width = strokeWidth(tool, size);

  if (tool === "roller") {
    return (
      <div
        className="bg-current"
        style={{
          width: Math.min(px, 70),
          height: ROLLER_HEIGHT * scale,
        }}
        aria-label={`${width} canvas pixels wide`}
      />
    );
  }

  if (tool === "spray") {
    return (
      <div
        className="rounded-full"
        style={{
          width: Math.min(px, 70),
          height: Math.min(px, 70),
          background: "radial-gradient(circle, currentColor 0 22%, transparent 76%)",
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="rounded-full bg-current"
      style={{ width: Math.min(px, 70), height: Math.min(px, 70) }}
      aria-label={`${width} canvas pixels wide`}
    />
  );
}

export default function BrushTools({
  color,
  size,
  tool,
  transparency,
  canvasWidth,
  onSize,
  onTool,
  onTransparency,
  onUndo,
  onClear,
}) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Tools
        </span>
        <div className="grid grid-cols-4 gap-2">
          {STUDIO_TOOLS.map(({ id, label }) => {
            const Glyph = GLYPHS[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTool(id)}
                aria-label={label}
                aria-pressed={tool === id}
                className={cn(TILE, "h-14 w-[76px] p-1.5", tool === id ? ON : OFF)}
              >
                <span className="h-6 w-6">
                  <Glyph />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Size
        </span>
        <div className="flex items-end gap-2">
          {BRUSH_SIZES.map((s) => {
            const active = size === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSize(s)}
                aria-label={`Size ${s}, ${strokeWidth(tool, s)} canvas pixels`}
                aria-pressed={active}
                className={cn(
                  TILE,
                  "relative h-[76px] w-[76px] p-1",
                  active ? ON : cn(OFF, "text-foreground/70"),
                )}
              >
                <span className="absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2 bg-current opacity-20" />
                <SizePreview tool={tool} size={s} canvasWidth={canvasWidth} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Transparency
          </span>
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {transparency}%
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={transparency}
            onChange={(event) => onTransparency(Number(event.target.value))}
            aria-label="Transparency"
            className="h-1.5 flex-1 cursor-pointer accent-white"
          />
          <div
            className="relative h-10 w-14 shrink-0 overflow-hidden rounded-sm border border-white/30"
            style={{
              backgroundColor: "#f7f2e6",
              backgroundImage:
                "linear-gradient(45deg, rgba(0,0,0,0.09) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.09) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.09) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.09) 75%)",
              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0",
              backgroundSize: "8px 8px",
            }}
            aria-label="Transparency preview"
          >
            <div
              className="absolute inset-x-2 top-1/2 h-3.5 -translate-y-1/2 rounded-full"
              style={{
                backgroundColor: color,
                opacity: opacityFromTransparency(transparency),
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Canvas
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTool("fill")}
            aria-label="Fill bucket"
            aria-pressed={tool === "fill"}
            className={cn(TILE, "h-10 w-10 p-2", tool === "fill" ? ON : OFF)}
          >
            <BucketGlyph />
          </button>
          <button
            type="button"
            onClick={onUndo}
            aria-label="Undo"
            className={cn(TILE, "h-10 w-10 p-2", OFF)}
          >
            <UndoGlyph />
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              aria-label="Delete all"
              className={cn(TILE, "h-10 w-10 p-2", OFF)}
            >
              <ClearGlyph />
            </button>
            {confirmClear && (
              <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-sm border-2 border-white/70 bg-black/85 px-3 py-2.5 text-right shadow-[4px_4px_0_0_rgba(0,0,0,0.55)]">
                <p className="font-heading text-[12px] leading-tight text-foreground">
                  Are you sure?
                </p>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                  This painting will be wiped clean.
                </p>
                <div className="mt-2.5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="rounded-sm border border-white/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-foreground/80 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClear(false);
                      onClear();
                    }}
                    className="rounded-sm border border-white bg-primary px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-primary-foreground hover:brightness-110"
                  >
                    Yes, delete all
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
