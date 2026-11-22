import { useEffect, useRef } from "react";
import { pointInRect } from "@/lib/hit-test";
import Backdrop from "@/components/game/Backdrop";
import StudioCat from "@/components/game/StudioCat";

// The studio, dim enough for white text to sit on it: bare wall, one crooked
// sheet taped up, a shelf of jars, a window and the floor. The easel itself is
// built in the page (see Easel.jsx) so the canvas really hangs on it.
export default function AtelierBackdrop({ showCat = false, onPrinterClick }) {
  const printerRef = useRef(null);

  useEffect(() => {
    if (!onPrinterClick) return undefined;

    // The scenery sits at z-index -10, so a click over the printer actually
    // lands on <body> rather than on the SVG. Hit-test the printer's own box
    // instead of turning it into a visible UI hotspot.
    const handleClick = (event) => {
      const printer = printerRef.current;
      if (!printer) return;

      // Anything drawn on top of the printer (palette wells, the canvas,
      // buttons, dialogs) still gets the click.
      if (
        event.target instanceof Element &&
        event.target.closest("button, input, select, textarea, a, canvas, label, svg, [role='dialog']")
      ) {
        return;
      }

      if (pointInRect(event.clientX, event.clientY, printer.getBoundingClientRect())) {
        onPrinterClick();
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onPrinterClick]);

  return (
    <Backdrop scrim="">
      <rect width="320" height="200" fill="#6a6355" />
      <rect width="320" height="10" fill="#756d5d" />
      <rect y="96" width="320" height="3" fill="#5d564a" />

      {/* crooked sheet taped to the wall */}
      <g transform="rotate(-4 46 54)">
        <rect x="24" y="26" width="44" height="56" fill="#ded8c8" />
        <rect x="30" y="34" width="14" height="10" fill="#7a2620" />
        <rect x="48" y="40" width="14" height="20" fill="#2c5c48" />
        <rect x="30" y="54" width="32" height="8" fill="#1e4568" />
        <rect x="30" y="70" width="20" height="4" fill="#8d7ba0" />
        <rect x="26" y="24" width="8" height="4" fill="#b3ab98" />
      </g>

      {/* window, dusk */}
      <rect x="228" y="18" width="70" height="58" fill="#8a6a44" />
      <rect x="232" y="22" width="62" height="50" fill="#7d8f96" />
      <rect x="232" y="22" width="62" height="16" fill="#93a4aa" />
      <rect x="260" y="22" width="4" height="50" fill="#8a6a44" />
      <rect x="232" y="44" width="62" height="4" fill="#8a6a44" />

      {/* floor boards */}
      <rect y="168" width="320" height="32" fill="#46321f" />
      <rect y="168" width="320" height="4" fill="#3a291a" />
      <rect y="186" width="320" height="3" fill="#3a291a" />
      <rect x="120" y="168" width="3" height="32" fill="#3a291a" />
      <rect x="236" y="168" width="3" height="32" fill="#3a291a" />

      {/* paint on the floor */}
      <rect x="96" y="180" width="10" height="4" fill="#7a2620" />
      <rect x="112" y="188" width="6" height="3" fill="#2c5c48" />
      <rect x="204" y="176" width="8" height="3" fill="#1e4568" />

      {/* shelf of jars */}
      <rect x="18" y="112" width="66" height="5" fill="#6b4d36" />
      <rect x="24" y="98" width="12" height="14" fill="#7a2620" />
      <rect x="40" y="92" width="12" height="20" fill="#2c5c48" />
      <rect x="56" y="102" width="12" height="10" fill="#8d7ba0" />

      {/* stool, legs planted on the floor line at y=168 */}
      <rect x="244" y="136" width="42" height="8" fill="#6b4d36" />
      <rect x="250" y="144" width="6" height="24" fill="#553c28" />
      <rect x="274" y="144" width="6" height="24" fill="#553c28" />

      {/* printer, left where it always sits; only clickable in the studio */}
      <g ref={printerRef}>
        <rect x="256" y="108" width="18" height="7" fill="#f7f4e8" />
        <rect x="256" y="108" width="18" height="2" fill="#c5b7cb" />
        <rect x="250" y="115" width="30" height="21" fill="#3c3444" />
        <rect x="250" y="115" width="30" height="4" fill="#6e576e" />
        <rect x="253" y="119" width="24" height="2" fill="#241c15" />
        <rect x="255" y="127" width="22" height="3" fill="#6e576e" />
        <rect x="255" y="131" width="22" height="3" fill="#241c15" />
        <rect x="274" y="122" width="3" height="3" fill="#c5b7cb" />
        <rect x="252" y="133" width="26" height="3" fill="#5f4f47" />
      </g>

      {showCat && <StudioCat />}

      {/* cut-out rim, same white edge the portraits have */}
      <rect width="3" height="200" fill="#f7f7f2" />
    </Backdrop>
  );
}