import { PALETTE } from "@/lib/bidders";
import { cn } from "@/lib/utils";

// The pigments sit on a chunky wooden palette drawn in the same crude cut-out
// style as the portraits: flat fills, dark outlines, stepped pixel edges.
const COLS = [40, 67, 94, 121, 148, 175, 202];
const ROWS = [78, 130];
const WELLS = ROWS.flatMap((cy) => COLS.map((cx) => ({ cx, cy })));

export default function Palette({ color, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Pigments</span>

      <div className="relative mx-auto w-full max-w-[260px]">
        <svg
          viewBox="0 0 240 224"
          shapeRendering="crispEdges"
          aria-hidden="true"
          className="block h-auto w-full"
        >
          <path
            d="M50 24 H190 V30 H204 V40 H214 V60 H222 V150 H214 V164 H200 V176 H176 V186 H120 V192 H76 V186 H52 V176 H34 V164 H22 V148 H16 V62 H24 V40 H34 V30 H50 Z"
            fill="#8a6a45"
            stroke="#141414"
            strokeWidth="7"
          />
          <rect x="40" y="32" width="160" height="8" fill="#a8825a" />
          <rect x="22" y="70" width="8" height="70" fill="#f7f7f2" opacity="0.5" />
          {WELLS.map(({ cx, cy }) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r="15"
              fill="#241c15"
              stroke="#141414"
              strokeWidth="3"
            />
          ))}
        </svg>

        {PALETTE.map((hex, i) => {
          const well = WELLS[i];
          if (!well) return null;
          return (
            <button
              key={hex}
              type="button"
              onClick={() => onChange(hex)}
              aria-label={`Colour ${hex}`}
              aria-pressed={color === hex}
              style={{
                backgroundColor: hex,
                left: `${(well.cx / 240) * 100}%`,
                top: `${(well.cy / 224) * 100}%`,
              }}
              className={cn(
                "absolute aspect-square w-[12.5%] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#141414] transition-transform duration-150",
                color === hex
                  ? "scale-110 ring-2 ring-white"
                  : "hover:scale-110",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}