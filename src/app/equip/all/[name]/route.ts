import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

type EquipmentType = "cash" | "normal" | "symbol";
const getBaseUrl = (type: EquipmentType, nickname: string) => {
  return `${process.env.PUBLIC_API_DOMAIN}/equip/${type}/${nickname}`;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date") ?? "";
  const urlParams = new URLSearchParams();
  if (date) urlParams.append("date", date);

  const cash = await (
    await fetch(`${getBaseUrl("cash", params.name)}?${urlParams.toString()}`)
  ).json();
  const normal = await (
    await fetch(`${getBaseUrl("normal", params.name)}?${urlParams.toString()}`)
  ).json();
  const symbol = await (
    await fetch(`${getBaseUrl("symbol", params.name)}?${urlParams.toString()}`)
  ).json();

  return Response.json({ cash, normal, symbol });
}
