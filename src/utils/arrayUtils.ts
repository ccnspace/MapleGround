export function countElements<T>(arr: T[]): Record<string, number> {
  return arr.reduce((acc: Record<string, number>, cur: T) => {
    const key = String(cur);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

export function isFullyContainedInArray<T>(array1: T[], array2: T[]): boolean {
  const count1 = countElements(array1);
  const count2 = countElements(array2);

  return Object.entries(count1).every(([key, value]) => {
    return (count2[key] || 0) >= value;
  });
}
