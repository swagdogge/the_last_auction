import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Types a line out one character at a time, while reserving its full height. */
export default function TypedLine({ text, className, speed = 15 }) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!text) {
      setShown("");
      return undefined;
    }
    setShown("");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setShown(text.slice(0, index));
      if (index >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div
      className={cn(
        "relative border-t border-white/10 bg-[#141414] px-3 py-2.5 text-[13px] leading-snug text-foreground/90",
        className,
      )}
    >
      {/* Invisible full text keeps every box as tall as the longest line. */}
      <span className="invisible" aria-hidden="true">
        &ldquo;{text}&rdquo;
      </span>
      <span className="absolute inset-x-3 top-2.5" aria-live="polite">
        &ldquo;{shown}&rdquo;
      </span>
    </div>
  );
}
