export const dynamic = "force-static";

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  const username = params.name;
  const res = await fetch(
    `${process.env.API_DOMAIN}/id?character_name=${username}`,
    {
      headers: {
        "x-nxopen-api-key": process.env.API_KEY || "",
      },
    }
  );
  const data = await res.json();
  return Response.json({ data });
}
