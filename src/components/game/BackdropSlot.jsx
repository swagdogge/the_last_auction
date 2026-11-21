import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Places its children exactly over a rectangle of the 320x200 backdrop drawing,
// so a real painting hangs in the frame painted on the wall instead of floating
// over the page. It is fixed to the viewport: it never scrolls.
export default function BackdropSlot({ x, y, w, h, className, children }) {
  const [box, setBox] = useState(null);

  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.max(vw / 320, vh / 200);
      setBox({
        left: (vw - 320 * scale) / 2 + x * scale,
        top: (vh - 200 * scale) / 2 + y * scale,
        width: w * scale,
        height: h * scale,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [x, y, w, h]);

  if (!box) return null;

  return (
    <div className={cn("absolute overflow-hidden", className)} style={box}>
      {children}
    </div>
  );
}