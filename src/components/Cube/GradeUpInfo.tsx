import { memo } from "react";

interface GradeUpInfoProps {
  gradeUpInfos: string[];
  cubeTitle: string;
}

export const GradeUpInfo = memo(({ gradeUpInfos, cubeTitle }: GradeUpInfoProps) => (
  <div className="flex justify-center">
    <div className="flex flex-col min-w-[214px] gap-0.5 text-xs bg-gradient-to-br from-slate-500 to-slate-600 rounded-md p-1.5">
      <p className="font-bold">{`🎲 ${cubeTitle} 등급 상승 확률`}</p>
      {gradeUpInfos.map((item, idx) => (
        <p key={idx} className="font-light">
          · {item}
        </p>
      ))}
    </div>
  </div>
));

GradeUpInfo.displayName = "GradeUpInfo";
