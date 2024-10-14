export function formatKoreanNumber(num: number): string {
  if (num === 0) return "0";

  const units = ["", "만", "억", "조"];
  const unitDivider = 10000;

  let result = "";
  let unitIndex = 0;

  while (num > 0) {
    const part = num % unitDivider;
    if (part > 0) {
      result = `${part}${units[unitIndex]} ${result}`;
    }
    num = Math.floor(num / unitDivider);
    unitIndex++;
  }

  return result;
}
