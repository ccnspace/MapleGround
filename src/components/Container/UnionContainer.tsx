import { ContainerWrapper } from "./ContainerWrapper";

export const UnionContainer = () => {
  return (
    <ContainerWrapper className="!min-w-0" innerClassName="h-[410px] overflow-y-auto">
      <div className="flex justify-between mb-2">
        <p className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 border-l-4 border-l-purple-400/80">유니온 정보</p>
      </div>
      <div className="flex items-center justify-center flex-1 font-bold text-slate-500">🛠️ 열심히 업데이트 중...</div>
    </ContainerWrapper>
  );
};
