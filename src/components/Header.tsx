import { ThemeChanger } from "./ThemeChanger";

export const Header = () => {
  return (
    <header className="flex justify-between items-center pr-8 shadow font-bold text-lg">
      <div className="pt-3 pb-3 pl-3 pr-3">MapleDot</div>
      <ThemeChanger />
    </header>
  );
};
