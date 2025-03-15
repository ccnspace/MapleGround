export const Badge = ({ text, bgColor }: { text: string; bgColor: string }) => {
  const ColorSet: { [key: string]: string } = {
    lime: "bg-lime-500",
    indigo: "bg-indigo-300",
    cyan: "bg-cyan-500",
    pink: "bg-pink-400",
    blue: "bg-blue-500",
  };

  return (
    <span
      className={`${ColorSet[bgColor]} w-fit tracking-tighter mx-1 text-xs rounded-sm
        text-black font-bold px-1 pt-0.5 pb-0.5`}
    >
      {text}
    </span>
  );
};
