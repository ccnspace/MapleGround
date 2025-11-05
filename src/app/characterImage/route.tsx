import { fetchOcid } from "@/utils/fetchOcid";
import dayjs from "dayjs";
import { NextRequest } from "next/server";

const API_KEY = process.env.API_KEY;
const NEXON_API_DOMAIN = process.env.NEXON_API_DOMAIN;

if (!API_KEY || !NEXON_API_DOMAIN) {
  throw new Error("Missing required environment variables");
}

const commonHeader: RequestInit = {
  headers: { "x-nxopen-api-key": API_KEY },
  next: { revalidate: 0 },
};

const endpoints = ["basic"] as const;

const makeRequestUrl = (ocid: string, date: string | null) => {
  const url = new URL(`${NEXON_API_DOMAIN}/character/basic`);
  const currentDate = dayjs().format("YYYY-MM-DD");
  url.searchParams.append("ocid", ocid);
  if (date && new Date(date) < new Date(currentDate)) {
    url.searchParams.append("date", date);
  }
  return url.toString();
};

// 개발 모드이면 초당 최대 5회까지의 호출 제한이 있어 부득이하게 wait를 걸어준다.
const wait = () => new Promise((resolve) => setTimeout(resolve, 200));

const fetchBasicInfo = async (url: string) => {
  if (process.env.NODE_ENV === "development") {
    await wait();
  }
  const response = await fetch(url, commonHeader);
  const json = await response.json();

  if (!response.ok) {
    return { character_name: "", character_image: "" };
  }
  return json;
};

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get("date") ?? null;
    const { ocids } = await request.json();
    const requestUrls = ocids.map((ocid: string) => makeRequestUrl(ocid, date));

    let responses = [] as { character_name: string; character_image: string }[];
    if (process.env.NODE_ENV === "development") {
      for (const url of requestUrls) {
        const response = await fetchBasicInfo(url);
        console.log(url);
        if (response.character_name && response.character_image) {
          responses.push({
            character_name: response.character_name,
            character_image: response.character_image,
          });
        }
      }
    } else {
      const settledResponses = await Promise.allSettled(requestUrls.map((url: string) => fetchBasicInfo(url)));
      responses = settledResponses
        .filter((response) => response.status === "fulfilled")
        .map((response) => {
          return {
            character_name: response.value.character_name,
            character_image: response.value.character_image,
          };
        });
    }

    return Response.json({ data: responses });
  } catch (e) {
    if (e instanceof Error) {
      const parsed = JSON.parse(e.message);
      return Response.json(parsed, { status: 400 });
    }
    return Response.json({ message: "Fetch Failed" }, { status: 400 });
  }
}
