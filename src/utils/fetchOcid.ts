type Params = {
  username: string;
  apiDomain: string;
  commonHeader: RequestInit;
};
export const fetchOcid = async ({ username, apiDomain, commonHeader }: Params) => {
  const response = await fetch(`${apiDomain}/id?character_name=${username}`, commonHeader);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify({ errorCode: error.error.name }));
  }
  return (await response.json()).ocid;
};
