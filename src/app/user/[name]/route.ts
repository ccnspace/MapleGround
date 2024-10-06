export const dynamic = "force-dynamic";

const commonHeader = {
  headers: {
    "x-nxopen-api-key": process.env.API_KEY || "",
  },
};

export async function GET(
  _request: Request,
  { params }: { params: { name: string } }
) {
  const username = params.name;
  const ocidResponse = await fetch(
    `${process.env.NEXON_API_DOMAIN}/id?character_name=${username}`,
    commonHeader
  );

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

  const characterResponse = await fetch(
    `${process.env.NEXON_API_DOMAIN}/character/basic?ocid=${ocidData.ocid}`,
    commonHeader
  );

  if (!characterResponse.ok) {
    const response = await characterResponse.json();
    return Response.json(
      { errorCode: response.error.name },
      {
        status: 400,
      }
    );
  }

  const characterData = await characterResponse.json();
  return Response.json(characterData);
}
