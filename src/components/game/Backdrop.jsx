import { cn } from "@/lib/utils";

// Full-screen pixel-block scenery drawn in the same crude cut-out style as the
// bidder portraits: flat fills, no gradients, hard edges. It sits behind the
// page and never takes a click. `overlay` holds things that belong inside the
// drawing (a painting in a painted frame); `scrim` is the optional full-screen
// shade, used only where no dark panel sits behind the text instead.
export default function Backdrop({ children, overlay, scrim }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 320 200"
        preserveAspectRatio="xMidYMid slice"
        shapeRendering="crispEdges"
        className="h-full w-full"
      >
        {children}
      </svg>
      {overlay}
      {scrim && <div className={cn("absolute inset-0", scrim)} />}
    </div>
  );
}