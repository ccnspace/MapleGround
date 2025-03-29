export const convertItemLevel = (itemLevel: number | undefined) => {
  if (!itemLevel) return "0";
  if (itemLevel < 30) return "30";
  if (itemLevel < 70) return "70";
  if (itemLevel < 119) return "100";
  if (itemLevel < 250) return "120";
  return "250";
};
