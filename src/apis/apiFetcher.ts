export const apiFetcher = async <Response>(url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Api request error occured");

  const data = await response.json();
  return data as Response;
};
