import { Spinner } from "./svg/Spinner";

export const DimmedLayer = ({ spinner }: { spinner?: boolean }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center opacity-50 bg-black z-40">
      {spinner && (
        <div className="flex flex-col justify-center items-center z-50">
          <Spinner width="5em" height="5em" />
          <p className="text-white">로딩 중...</p>
        </div>
      )}
    </div>
  );
};
