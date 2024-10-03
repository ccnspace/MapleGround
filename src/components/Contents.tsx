"use client";

export const Contents = () => {
  const handleClick = async () => {
    await fetch("/user/...");
  };
  return <button onClick={handleClick}>클릭</button>;
};
