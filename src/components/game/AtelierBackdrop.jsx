import Backdrop from "@/components/game/Backdrop";

// The studio, dim enough for white text to sit on it: bare wall, one crooked
// sheet taped up, a shelf of jars, a window and the floor. The easel itself is
// built in the page (see Easel.jsx) so the canvas really hangs on it.
export default function AtelierBackdrop() {
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

      {/* stool */}
      <rect x="244" y="132" width="42" height="8" fill="#6b4d36" />
      <rect x="250" y="140" width="6" height="24" fill="#553c28" />
      <rect x="274" y="140" width="6" height="24" fill="#553c28" />

      {/* cut-out rim, same white edge the portraits have */}
      <rect width="3" height="200" fill="#f7f7f2" />
    </Backdrop>
  );
}