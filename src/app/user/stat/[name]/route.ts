import { fetchOcid } from "@/utils/fetchOcid";
import { shiftDateByMonth } from "@/utils/shiftDateByMonths";
import dayjs from "dayjs";
import { NextRequest } from "next/server";

const API_KEY = process.env.API_KEY;
const NEXON_API_DOMAIN = process.env.NEXON_API_DOMAIN;

if (!API_KEY || !NEXON_API_DOMAIN) {
  throw new Error("Missing required environment variables");
}

const commonHeader: RequestInit = {
  headers: {
    "x-nxopen-api-key": API_KEY,
  },
  next: { revalidate: 0 },
};

const requestDates = [-12, -8, -5, -4, -3, -2, -1].map(shiftDateByMonth);

const makeRequestUrls = (ocid: string) => {
  const baseUrl = new URL(`${NEXON_API_DOMAIN}/character/stat`);
  baseUrl.searchParams.append("ocid", ocid);

  return requestDates
    .map((date) => {
      const url = new URL(baseUrl.toString());
      url.searchParams.append("date", date);
      return url.toString();
    })
    .concat(baseUrl.toString());
};

// 개발 모드이면 초당 최대 5회까지의 호출 제한이 있어 부득이하게 wait를 걸어준다.
const wait = () => new Promise((resolve) => setTimeout(resolve, 500));

const fetchCharacterStats = async (url: string) => {
  console.log("Fetching: ", url);
  await wait();
  const response = await fetch(url, commonHeader);
  const json = await response.json();

  if (!response.ok) {
    const requestUrl = new URL(url);
    requestUrl.searchParams.delete("ocid");
    throw new Error(
      JSON.stringify({
        name: json.error.name,
        message: json.error.message,
        requestUrl: requestUrl.toString(),
      })
    );
  }
  return json;
};

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const ocid = await fetchOcid({ username: params.name, apiDomain: NEXON_API_DOMAIN || "", commonHeader });
    const requestUrls = makeRequestUrls(ocid);

    const responses = [] as unknown[];
    for (const url of requestUrls) {
      try {
        const data = await fetchCharacterStats(url);
        responses.push(data);
      } catch (e) {
        console.error("Error fetching: ", e);
        responses.push(null); // 실패한 요청은 null 처리
      }
    }

    // TODO: 날짜 관련 리팩토링
    const today = dayjs(new Date()).format("YYYY-MM-DD");
    const jsonResponse = [...requestDates, today].reduce((acc, date, index) => {
      acc[date] = responses[index];
      return acc;
    }, {} as Record<string, unknown>);

    return Response.json(jsonResponse);
  } catch (e) {
    if (e instanceof Error) {
      const parsed = JSON.parse(e.message);
      return Response.json(parsed, { status: 400 });
    }
    return Response.json({ message: "Fetch Failed" }, { status: 400 });
  }
}
