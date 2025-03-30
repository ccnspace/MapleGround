import { memo } from "react";
import CheckBox from "../CheckBox";

interface SettingsProps {
  isSoundEnabled: boolean;
  setIsSoundEnabled: (enabled: boolean) => void;
  isMiracleChecked: boolean;
  setIsMiracleChecked: (checked: boolean) => void;
  isSpeedMode: boolean;
}

export const CubeSetting = memo(
  ({ isSoundEnabled, setIsSoundEnabled, isMiracleChecked, setIsMiracleChecked, isSpeedMode }: SettingsProps) => (
    <>
      <p className="text-sm font-bold mb-1 bg-white/20 p-1 rounded-md">⚙️ 기본 설정</p>
      <div className="flex gap-2 justify-center">
        <CheckBox label={"큐브 사운드 재생"} checked={isSoundEnabled} onChange={setIsSoundEnabled} disabled={isSpeedMode} />
        <CheckBox label={"미라클 타임"} checked={isMiracleChecked} onChange={setIsMiracleChecked} disabled={isSpeedMode} />
      </div>
    </>
  )
);

CubeSetting.displayName = "CubeSetting";
