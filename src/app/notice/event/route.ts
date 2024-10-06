export const dynamic = "force-dynamic";

const commonHeader = {
  headers: {
    "x-nxopen-api-key": process.env.API_KEY || "",
  },
};

export async function GET(_request: Request) {
  const eventResponse = await fetch(
    `${process.env.NEXON_API_DOMAIN}/notice-event`,
    commonHeader
  );

  if (!eventResponse.ok) {
    const response = await eventResponse.json();
    return Response.json(
      { errorCode: response.error.name },
      {
        status: 400,
      }
    );
  }

  const eventData = await eventResponse.json();
  return Response.json(eventData);
}
