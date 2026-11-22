/** Whether a viewport point falls inside a DOMRect-like box. */
export function pointInRect(x, y, rect) {
  return Boolean(rect) && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
