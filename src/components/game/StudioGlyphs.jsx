// Studio tool marks drawn in the same crude cut-out language as the bidder
// portraits: chunky rects, dark hard outlines, flat fills, no gradients.
const svgProps = {
  viewBox: "0 0 24 24",
  shapeRendering: "crispEdges",
  "aria-hidden": "true",
  className: "block h-full w-full",
};

const ink = "#141414";

export function BrushGlyph() {
  return (
    <svg {...svgProps}>
      <g transform="rotate(-38 12 12)">
        <rect x="10.5" y="1" width="4" height="11" fill="#a8794c" stroke={ink} strokeWidth="1.2" />
        <rect x="9.5" y="11.5" width="6" height="3.5" fill="#c9c4bb" stroke={ink} strokeWidth="1.2" />
        <rect x="8.5" y="15" width="8" height="3" fill={ink} />
        <rect x="9" y="18" width="7" height="4" fill="#b8452b" stroke={ink} strokeWidth="1.2" />
      </g>
    </svg>
  );
}

export function BucketGlyph() {
  return (
    <svg {...svgProps}>
      <rect x="8" y="1.5" width="8" height="2" fill="#c9c4bb" stroke={ink} strokeWidth="1" />
      <g transform="rotate(-18 12 13)">
        <rect x="4" y="4.5" width="15" height="3" fill="#1f4e79" stroke={ink} strokeWidth="1.2" />
        <rect x="5" y="7.5" width="13" height="11" fill="#5b8fc9" stroke={ink} strokeWidth="1.2" />
        <rect x="7" y="10" width="4" height="4" fill="#7fae7a" />
        <rect x="12" y="10" width="4" height="2" fill="#e2a33c" />
      </g>
      <rect x="18" y="19" width="3" height="3" fill="#5b8fc9" stroke={ink} strokeWidth="0.8" />
    </svg>
  );
}

export function UndoGlyph() {
  return (
    <svg {...svgProps}>
      <path
        d="M10 7 H7 V9 H4 V15 H7 V17 H10 Z"
        fill="#e2a33c"
        stroke={ink}
        strokeWidth="1.2"
      />
      <rect x="9" y="10.5" width="11" height="3" fill="#e2a33c" stroke={ink} strokeWidth="1.2" />
    </svg>
  );
}

export function ClearGlyph() {
  return (
    <svg {...svgProps}>
      <rect x="9" y="2" width="6" height="2.5" fill="#c9c4bb" stroke={ink} strokeWidth="1" />
      <rect x="3.5" y="5" width="17" height="3" fill="#c9c4bb" stroke={ink} strokeWidth="1.2" />
      <rect x="6" y="8" width="12" height="13" fill="#8c8c86" stroke={ink} strokeWidth="1.2" />
      <rect x="8.5" y="11" width="2" height="7" fill={ink} />
      <rect x="13.5" y="11" width="2" height="7" fill={ink} />
    </svg>
  );
}