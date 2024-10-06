export const dynamic = "force-dynamic";

const commonHeader = {
  headers: {
    "x-nxopen-api-key": process.env.API_KEY || "",
  },
};

export async function GET(_request: Request) {
  const updateResponse = await fetch(
    `${process.env.NEXON_API_DOMAIN}/notice-update`,
    commonHeader
  );

  if (!updateResponse.ok) {
    const response = await updateResponse.json();
    return Response.json(
      { errorCode: response.error.name },
      {
        status: 400,
      }
    );
  }

  const updateData = await updateResponse.json();
  return Response.json(updateData);
}
