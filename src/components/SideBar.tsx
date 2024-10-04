import { ReactElement } from "react";
import { ProfileWrapper } from "./Profile";
import { SideBarItem } from "./SideBarItem";
import { HomeIcon } from "./svg/HomeIcon";
import { ProfileIcon } from "./svg/ProfileIcon";

export type SideBarItemType = { icon: ReactElement; title: string };
const sidebarItem: SideBarItemType[] = [
  {
    icon: <HomeIcon />,
    title: "홈",
  },
  {
    icon: <ProfileIcon />,
    title: "확률",
  },
  {
    icon: <HomeIcon />,
    title: "기타",
  },
  {
    icon: <ProfileIcon />,
    title: "과거와 대결",
  },
];

export const SideBar = () => {
  return (
    <div className="fixed h-full w-96 bg-coreNavy font-bold text-lg">
      <ProfileWrapper />
      <ul className="text-white">
        {sidebarItem.map((item, i) => (
          <SideBarItem item={item} key={i} />
        ))}
      </ul>
    </div>
  );
};
