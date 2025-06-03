"use client";

import { ContainerWrapper } from "./ContainerWrapper";

export const ExpContentContainer = () => {
  return (
    <ContainerWrapper className="expContent_container min-h-72">
      <div className="flex flex-col justify-center">
        <div className="flex justify-between mb-2">
          <p
            className="flex font-extrabold text-base mb-2 px-2 pb-0.5 pt-0.5 
              border-l-4 border-l-fuchsia-400/80
             "
          >
            경험치 효율
          </p>
        </div>
        <div className="flex flex-row justify-around"></div>
      </div>
    </ContainerWrapper>
  );
};
