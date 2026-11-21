export function formatMoney(n) {
  return "$" + Math.round(Number(n) || 0).toLocaleString("en-US");
}

export function formatCompact(n) {
  const v = Math.round(Number(n) || 0);
  if (v >= 1000000) {
    const m = v / 1000000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (v >= 1000) return `$${Math.round(v / 1000)}K`;
  return `$${v}`;
}