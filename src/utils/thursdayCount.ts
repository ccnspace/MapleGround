// 메이플 주간 보스는 매주 목요일 00:00(KST) 에 리셋되므로,
// 한 달 안에서 클리어 가능한 주간 보스 주 수 = 그 달에 포함된 목요일 개수 이다.
export const countThursdaysInMonth = (date: Date = new Date()): number => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= lastDay; d++) {
    if (new Date(y, m, d).getDay() === 4) count++;
  }
  return count;
};
