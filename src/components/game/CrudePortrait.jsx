import { cn } from "@/lib/utils";

// Deliberately crude cut-out portraits: blocky MS-Paint faces, white cutout
// rims, pasted-over seams and heads clipped by the frame. Each one is drawn on
// a 64x80 grid so it stays chunky when the card scales it up.
const PORTRAITS = {
  gordon: (
    <>
      <rect width="64" height="80" fill="#aebec6" />
      <rect y="52" width="64" height="6" fill="#c3d1d6" />
      <rect x="12" y="60" width="40" height="20" fill="#3b3b3d" />
      <rect x="26" y="52" width="12" height="10" fill="#d99a72" />
      <rect x="17" y="20" width="30" height="34" fill="#e3ab84" />
      <rect x="17" y="20" width="30" height="6" fill="#d39772" />
      <rect x="14" y="12" width="36" height="10" fill="#b8452b" />
      <rect x="10" y="18" width="8" height="8" fill="#b8452b" />
      <rect x="20" y="0" width="24" height="14" fill="#f4f2ea" />
      <rect x="20" y="10" width="24" height="3" fill="#d8d5c9" />
      <rect x="21" y="28" width="9" height="3" fill="#6b2f1f" transform="rotate(-12 25 29)" />
      <rect x="34" y="28" width="9" height="3" fill="#6b2f1f" transform="rotate(12 38 29)" />
      <rect x="22" y="33" width="4" height="4" fill="#1a1a1a" />
      <rect x="35" y="33" width="6" height="5" fill="#1a1a1a" />
      <rect x="23" y="44" width="18" height="5" fill="#6f2a20" />
      <rect x="26" y="45" width="12" height="2" fill="#f2efe4" />
      <rect y="47" width="64" height="4" fill="#aebec6" />
      <rect x="0" y="0" width="3" height="80" fill="#f7f7f2" />
    </>
  ),
  julian: (
    <>
      <rect width="64" height="80" fill="#cfc7b4" />
      <rect y="0" width="64" height="10" fill="#dcd6c4" />
      <rect x="14" y="18" width="36" height="40" fill="#ffffff" />
      <rect x="16" y="20" width="32" height="36" fill="#ecc5a4" />
      <rect x="16" y="16" width="32" height="9" fill="#2e2622" />
      <rect x="16" y="16" width="32" height="3" fill="#3d332d" />
      <circle cx="25" cy="34" r="6" fill="none" stroke="#141414" strokeWidth="2" />
      <circle cx="41" cy="34" r="6" fill="none" stroke="#141414" strokeWidth="2" />
      <rect x="31" y="33" width="4" height="2" fill="#141414" />
      <rect x="23" y="33" width="3" height="3" fill="#141414" />
      <rect x="39" y="33" width="3" height="3" fill="#141414" />
      <rect x="32" y="40" width="3" height="6" fill="#d9ab89" />
      <rect x="26" y="48" width="14" height="2" fill="#7a3a30" />
      <rect x="38" y="46" width="3" height="2" fill="#7a3a30" />
      <rect x="48" y="32" width="6" height="8" fill="#ecc5a4" />
      <rect x="14" y="58" width="36" height="22" fill="#1c1c1c" />
      <rect x="24" y="54" width="16" height="6" fill="#2a2a2a" />
      <rect x="56" y="70" width="8" height="10" fill="#ffffff" />
    </>
  ),
  leopold: (
    <>
      <rect width="64" height="80" fill="#c8bb9d" />
      <rect y="46" width="64" height="4" fill="#d6cbb2" />
      <g transform="rotate(-14 32 12)">
        <rect x="18" y="6" width="28" height="10" fill="#d8b03c" />
        <rect x="20" y="0" width="5" height="7" fill="#d8b03c" />
        <rect x="30" y="0" width="5" height="7" fill="#d8b03c" />
        <rect x="40" y="0" width="5" height="7" fill="#d8b03c" />
      </g>
      <rect x="16" y="22" width="32" height="34" fill="#efc7a6" />
      <rect x="12" y="24" width="6" height="16" fill="#c9c4bb" />
      <rect x="46" y="24" width="6" height="16" fill="#c9c4bb" />
      <circle cx="40" cy="34" r="7" fill="none" stroke="#c9a227" strokeWidth="2" />
      <circle cx="40" cy="34" r="1.5" fill="#1a1a1a" />
      <rect x="24" y="33" width="3" height="3" fill="#1a1a1a" />
      <rect x="31" y="36" width="4" height="10" fill="#e0b494" />
      <rect x="23" y="48" width="18" height="3" fill="#cfc9bd" />
      <rect y="16" width="64" height="2" fill="#b3a687" />
      <rect x="12" y="58" width="40" height="22" fill="#2f3542" />
    </>
  ),
  marguerite: (
    <>
      <rect width="64" height="80" fill="#b9a8c0" />
      <rect x="6" y="10" width="52" height="30" fill="#2b2033" />
      <rect x="0" y="18" width="12" height="18" fill="#2b2033" />
      <rect x="52" y="6" width="12" height="26" fill="#2b2033" />
      <rect x="14" y="0" width="36" height="14" fill="#3a2b45" />
      <rect x="18" y="22" width="28" height="34" fill="#f0cfae" />
      <circle cx="27" cy="34" r="5" fill="#f7f4ea" stroke="#141414" strokeWidth="1.5" />
      <circle cx="27" cy="34" r="2" fill="#141414" />
      <rect x="37" y="32" width="4" height="4" fill="#141414" />
      <rect x="22" y="26" width="10" height="2" fill="#3b2b1f" transform="rotate(-8 27 27)" />
      <rect x="36" y="28" width="7" height="2" fill="#3b2b1f" />
      <rect x="31" y="38" width="3" height="7" fill="#e0b494" />
      <rect x="26" y="48" width="14" height="4" fill="#a8342f" />
      <rect x="42" y="40" width="8" height="6" fill="#3fa89b" />
      <rect x="18" y="52" width="28" height="5" fill="#b9a8c0" />
      <rect x="10" y="60" width="44" height="20" fill="#4a3a52" />
    </>
  ),
  ines: (
    <>
      <rect width="64" height="80" fill="#a9bfb2" />
      <rect y="0" width="64" height="14" fill="#cfe0e8" />
      <rect x="-6" y="12" width="76" height="8" fill="#c2a271" />
      <rect x="18" y="2" width="28" height="12" fill="#d3b383" />
      <rect x="18" y="10" width="28" height="3" fill="#8a6a44" />
      <rect x="18" y="22" width="28" height="32" fill="#f2cbaa" />
      <rect x="14" y="24" width="6" height="22" fill="#8a5a3a" />
      <rect x="44" y="24" width="6" height="22" fill="#8a5a3a" />
      <rect x="23" y="33" width="4" height="3" fill="#1f2a33" />
      <rect x="37" y="33" width="4" height="3" fill="#1f2a33" />
      <rect x="22" y="29" width="7" height="2" fill="#7a4a2e" />
      <rect x="36" y="29" width="7" height="2" fill="#7a4a2e" />
      <rect x="31" y="36" width="3" height="7" fill="#e2b492" />
      <rect x="24" y="46" width="16" height="3" fill="#a94a3d" />
      <rect x="24" y="44" width="4" height="2" fill="#a94a3d" />
      <rect x="36" y="44" width="4" height="2" fill="#a94a3d" />
      <rect x="22" y="54" width="20" height="6" fill="#c9a227" />
      <rect x="12" y="58" width="40" height="22" fill="#4f6b52" />
      <rect x="0" y="66" width="12" height="14" fill="#ffffff" />
    </>
  ),
  chad: (
    <>
      <rect width="64" height="80" fill="#b8a58f" />
      <rect x="32" y="0" width="32" height="80" fill="#c9b69f" />
      <rect x="16" y="10" width="32" height="12" fill="#2f6b4f" />
      <rect x="40" y="14" width="18" height="6" fill="#2f6b4f" />
      <rect x="30" y="8" width="6" height="4" fill="#7fae7a" />
      <rect x="16" y="20" width="32" height="34" fill="#f0c6a0" />
      <rect x="12" y="32" width="4" height="8" fill="#e6b993" />
      <rect x="48" y="32" width="4" height="8" fill="#e6b993" />
      <rect x="22" y="32" width="6" height="3" fill="#1a1a1a" />
      <rect x="36" y="32" width="6" height="3" fill="#1a1a1a" />
      <rect x="31" y="36" width="3" height="6" fill="#dfae86" />
      <rect x="22" y="44" width="20" height="8" fill="#ffffff" />
      <rect x="22" y="44" width="20" height="2" fill="#a94a3d" />
      <rect x="22" y="50" width="20" height="2" fill="#a94a3d" />
      <rect x="30" y="46" width="1.5" height="6" fill="#d8d2c4" />
      <rect x="35" y="46" width="1.5" height="6" fill="#d8d2c4" />
      <rect x="10" y="26" width="5" height="12" fill="#1f4e79" />
      <rect x="49" y="26" width="5" height="12" fill="#1f4e79" />
      <rect x="10" y="58" width="44" height="22" fill="#e07a3f" />
      <rect x="26" y="56" width="12" height="6" fill="#c9682f" />
      <rect x="54" y="60" width="10" height="10" fill="none" stroke="#ffffff" strokeWidth="1" />
    </>
  ),
};

const TILT = {
  gordon: -1.2,
  julian: 1.5,
  leopold: -0.8,
  marguerite: 2,
  ines: -1.6,
  chad: 1,
};

export default function CrudePortrait({ bidderId, className }) {
  return (
    <svg
      viewBox="0 0 64 80"
      preserveAspectRatio="xMidYMid slice"
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
      style={{
        transform: `rotate(${TILT[bidderId] ?? 0}deg) scale(1.06)`,
        filter: "drop-shadow(0 0 1.5px #ffffff)",
      }}
    >
      {PORTRAITS[bidderId] ?? PORTRAITS.gordon}
    </svg>
  );
}