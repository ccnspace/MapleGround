export const logout = async () => {
  const response = await fetch("/logout");
  if (!response.ok) {
    throw new Error("로그아웃 실패");
  }
  window.location.href = "/";
};
