import { Spinner } from "./svg/Spinner";

export const DimmedLayer = ({ style, spinner }: { style?: React.CSSProperties; spinner?: boolean }) => {
  return (
    <div style={style} className="fixed top-0 left-0 w-full h-full flex justify-center items-center opacity-20 bg-black z-40">
      {spinner && (
        <div className="flex flex-col justify-center items-center z-50">
          <Spinner width="6em" height="6em" />
        </div>
      )}
    </div>
  );
};
