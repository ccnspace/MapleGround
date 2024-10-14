export const dynamic = "force-dynamic";

const commonHeader = {
  headers: {
    "x-nxopen-api-key": process.env.API_KEY || "",
  },
};

export async function GET(_request: Request) {
  const noticeResponse = await fetch(`${process.env.NEXON_API_DOMAIN}/notice`, {
    ...commonHeader,
    next: { revalidate: 0 },
  });

  if (!noticeResponse.ok) {
    const response = await noticeResponse.json();
    return Response.json(
      { errorCode: response.error.name },
      {
        status: 400,
      }
    );
  }

  const noticeData = await noticeResponse.json();
  return Response.json(noticeData);
}
