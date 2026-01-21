export const getOAuthUrl = async () => {
  const response = await fetch("/openId");
  const { authUrl } = await response.json();
  return authUrl;
};
