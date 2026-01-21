import { getUserInfoByOAuth } from "@/apis/getUserInfoByOAuth";
import { useEffect } from "react";
import { useLoggedInStore } from "@/stores/loggedIn";
import { useShallow } from "zustand/react/shallow";

export const useLoggedIn = () => {
  const { loggedInUserInfo, setLoggedInUserInfo, fetchStatus, setFetchStatus } = useLoggedInStore(
    useShallow((state) => ({
      loggedInUserInfo: state.loggedInUserInfo,
      setLoggedInUserInfo: state.setLoggedInUserInfo,
      fetchStatus: state.fetchStatus,
      setFetchStatus: state.setFetchStatus,
    }))
  );

  useEffect(() => {
    if (fetchStatus !== "idle") return;
    setFetchStatus("loading");
    getUserInfoByOAuth()
      .then((userInfo) => {
        setLoggedInUserInfo(userInfo);
        setFetchStatus("success");
      })
      .catch(() => {
        setLoggedInUserInfo(null);
        setFetchStatus("error");
      });
  }, [fetchStatus]);
  return { loggedInUserInfo, fetchStatus };
};
