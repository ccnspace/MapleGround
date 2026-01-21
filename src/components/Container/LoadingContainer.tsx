import { Spinner } from "@/components/svg/Spinner";
import { DimmedLayer } from "../DimmedLayer";

export const LoadingContainer = () => {
  return (
    <div className="main_loading w-[1366px] h-[calc(100vh-80px)] flex flex-col items-center justify-center max-[600px]:w-full">
      <Spinner width="5em" height="5em" color="white" />
      <p className="text-md text-white animate-pulse font-medium tracking-wide">정보를 불러오는 중입니다</p>
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center opacity-40 bg-black -z-20" />
    </div>
  );
};
