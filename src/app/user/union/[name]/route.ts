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

const endpoints = ["union", "union-raider", "union-artifact", "union-champion"] as const;

const makeRequestUrls = (ocid: string, date: string | null) => {
  return endpoints.map((endpoint) => {
    const url = new URL(`${NEXON_API_DOMAIN}/user/${endpoint}`);
    const currentDate = dayjs().format("YYYY-MM-DD");
    url.searchParams.append("ocid", ocid);
    if (date && new Date(date) < new Date(currentDate)) {
      url.searchParams.append("date", date);
    }
    return url.toString();
  });
};

// 개발 모드이면 초당 최대 5회까지의 호출 제한이 있어 부득이하게 wait를 걸어준다.
const wait = () => new Promise((resolve) => setTimeout(resolve, 500));

const fetchUnionInfo = async (url: string) => {
  if (process.env.NODE_ENV === "development") {
    await wait();
  }
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
    const date = request.nextUrl.searchParams.get("date") ?? null;
    const ocid = await fetchOcid({ username: params.name, apiDomain: NEXON_API_DOMAIN || "", commonHeader });
    const requestUrls = makeRequestUrls(ocid, date);

    const responses = [] as { name: string; data: unknown }[];
    for (let i = 0; i < requestUrls.length; i++) {
      const data = await fetchUnionInfo(requestUrls[i]);
      responses.push({ name: endpoints[i], data });
    }

    const union = responses.find((res) => res.name === "union")?.data;
    const unionRaider = responses.find((res) => res.name === "union-raider")?.data;
    const unionArtifact = responses.find((res) => res.name === "union-artifact")?.data;
    const unionChampion = responses.find((res) => res.name === "union-champion")?.data;

    return Response.json({
      union,
      unionRaider,
      unionArtifact,
      unionChampion,
    });
  } catch (e) {
    if (e instanceof Error) {
      const parsed = JSON.parse(e.message);
      return Response.json(parsed, { status: 400 });
    }
    return Response.json({ message: "Fetch Failed" }, { status: 400 });
  }
}
