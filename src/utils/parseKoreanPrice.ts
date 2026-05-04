// 사용자가 자유롭게 입력하는 메소 금액 문자열을 숫자로 파싱한다.
// 지원 형태: "150000000", "1억 5000만", "1.5억", "1,500,000", "5000만 1234".
// 단위가 하나도 없는 경우 정수형 그대로(쉼표/공백 제거 후) 해석.
// 파싱할 수 없거나 음수면 null.
export const parseKoreanPrice = (input: string): number | null => {
  if (!input) return null;
  const cleaned = input.replace(/[,\s]/g, "");
  if (!cleaned) return null;

  // 단위가 하나도 없으면 그냥 숫자로 본다.
  if (/^[0-9]+(\.[0-9]+)?$/.test(cleaned)) {
    const n = Number(cleaned);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.floor(n);
  }

  // 조 / 억 / 만 단위 + 끝에 일(단위 없는) 숫자가 붙는 형태를 허용.
  const pattern = /^(?:([0-9]+(?:\.[0-9]+)?)조)?(?:([0-9]+(?:\.[0-9]+)?)억)?(?:([0-9]+(?:\.[0-9]+)?)만)?([0-9]+(?:\.[0-9]+)?)?$/;
  const match = cleaned.match(pattern);
  if (!match) return null;

  const [, jo, eok, man, rest] = match;
  if (!jo && !eok && !man && !rest) return null;

  let total = 0;
  if (jo) total += Number(jo) * 1_0000_0000_0000;
  if (eok) total += Number(eok) * 1_0000_0000;
  if (man) total += Number(man) * 1_0000;
  if (rest) total += Number(rest);

  if (!Number.isFinite(total) || total < 0) return null;
  return Math.floor(total);
};
