import { BRUSH_SIZES } from "@/lib/bidders";
import {
  BrushGlyph,
  BucketGlyph,
  ClearGlyph,
  UndoGlyph,
} from "@/components/game/StudioGlyphs";
import { cn } from "@/lib/utils";

const TILE = "flex h-10 w-10 items-center justify-center rounded-sm border-2 transition-all";
const OFF = "border-white/25 bg-black/35 hover:border-white/60";
const ON = "border-white bg-white/90 text-[#141414] shadow-[3px_3px_0_0_rgba(0,0,0,0.55)]";

const DOT = { 5: 5, 16: 11, 38: 17 };

export default function BrushTools({ size, tool, onSize, onTool, onUndo, onClear }) {
  return (
    <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-start sm:gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Brush</span>
        <div className="flex items-center gap-2">
          {BRUSH_SIZES.map((s) => {
            const active = size === s && tool === "brush";
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onSize(s);
                  onTool("brush");
                }}
                aria-label={`Brush size ${s}`}
                className={cn(
                  TILE,
                  active ? ON : cn(OFF, "text-foreground/80"),
                )}
              >
                <span
                  className="block bg-current"
                  style={{ width: DOT[s], height: DOT[s] }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Tools</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onTool("brush")}
            aria-label="Brush tool"
            className={cn(TILE, "p-2", tool === "brush" ? ON : OFF)}
          >
            <BrushGlyph />
          </button>
          <button
            type="button"
            onClick={() => onTool("fill")}
            aria-label="Fill bucket"
            className={cn(TILE, "p-2", tool === "fill" ? ON : OFF)}
          >
            <BucketGlyph />
          </button>
          <button
            type="button"
            onClick={onUndo}
            aria-label="Undo"
            className={cn(TILE, "p-2", OFF)}
          >
            <UndoGlyph />
          </button>
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear canvas"
            className={cn(TILE, "p-2", OFF)}
          >
            <ClearGlyph />
          </button>
        </div>
      </div>
    </div>
  );
}