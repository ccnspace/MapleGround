import dayjs from "dayjs";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const commonHeader = {
  headers: {
    "x-nxopen-api-key": process.env.API_KEY || "",
  },
};

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  const username = params.name;
  const ocidResponse = await fetch(`${process.env.NEXON_API_DOMAIN}/id?character_name=${username}`, commonHeader);

  if (!ocidResponse.ok) {
    const response = await ocidResponse.json();
    return Response.json(
      { errorCode: response.error.name },
      {
        status: 400,
      }
    );
  }

  const ocidData = (await ocidResponse.json()) as { ocid: string };
  const searchParams = request.nextUrl.searchParams;
  const date = searchParams.get("date") ?? "";
  const isToday = dayjs(Date.now()).format("YYYY-MM-DD") === date;

  const baseUrl = `${process.env.NEXON_API_DOMAIN}/character/item-equipment`;
  const urlParams = new URLSearchParams();
  if (ocidData.ocid) urlParams.append("ocid", ocidData.ocid);
  if (date && !isToday) urlParams.append("date", date);

  const requestUrl = `${baseUrl}?${urlParams.toString()}`;

  const equipResponse = await fetch(requestUrl, commonHeader);

  if (!equipResponse.ok) {
    const response = await equipResponse.json();
    return Response.json(
      { errorCode: response.error.name },
      {
        status: 400,
      }
    );
  }

  const equipData = await equipResponse.json();
  return Response.json(equipData);
}
