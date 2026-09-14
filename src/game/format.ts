const SUFFIX = ["", "K", "M", "B", "T", "Qa", "Qi"];

export function formatNum(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "0";
  const sign = n < 0 ? "-" : "";
  let v = Math.abs(n);
  if (v < 1000) {
    return sign + (v < 10 && v % 1 !== 0 ? v.toFixed(1) : Math.floor(v).toString());
  }
  let i = 0;
  while (v >= 1000 && i < SUFFIX.length - 1) {
    v /= 1000;
    i += 1;
  }
  if (i === SUFFIX.length - 1 && v >= 1000) {
    return sign + v.toExponential(2).replace("+", "");
  }
  const body = v >= 100 ? v.toFixed(0) : v.toFixed(digits).replace(/\.?0+$/, "");
  return sign + body + SUFFIX[i];
}

export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}
