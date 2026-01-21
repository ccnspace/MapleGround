import { apiFetcher } from "./apiFetcher";

export type LoggedInUserInfo = {
  uid: string;
  scope: string[];
};

export const getUserInfoByOAuth = async () => {
  const userInfo = await apiFetcher<{ result: LoggedInUserInfo }>({ url: "/userInfo", enableErrorModal: false });
  return userInfo.result;
};
