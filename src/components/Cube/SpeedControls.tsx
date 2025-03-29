interface SpeedControlsProps {
  speedStep: number;
  onSpeedUp: () => void;
  onSpeedDown: () => void;
  isMaxSpeed: boolean;
}

export const SpeedControls = ({ speedStep, onSpeedUp, onSpeedDown, isMaxSpeed }: SpeedControlsProps) => {
  return (
    <div className="flex flex-row w-[100%] gap-1.5 justify-center items-center">
      <button
        disabled={isMaxSpeed}
        className="relative text-white font-bold w-[10%] text-xs p-0.5 mt-1.5 rounded-md flex
          justify-center items-center
          disabled:bg-gray-800 disabled:text-white/50
          enabled:bg-gradient-to-tr from-yellow-400 to-yellow-600
          enabled:hover:bg-gradient-to-tr hover:from-yellow-600 hover:to-yellow-700"
        onClick={onSpeedUp}
      >
        <p>{"▲"}</p>
      </button>
      <button
        disabled={speedStep === 1}
        className="relative text-white font-bold w-[10%] text-xs p-0.5 mt-1.5 rounded-md flex
          justify-center items-center
          disabled:bg-gray-800 disabled:text-white/50
          enabled:bg-gradient-to-tr from-yellow-400 to-yellow-600
          enabled:hover:bg-gradient-to-tr hover:from-yellow-600 hover:to-yellow-700"
        onClick={onSpeedDown}
      >
        <p>{"▼"}</p>
      </button>
    </div>
  );
};
