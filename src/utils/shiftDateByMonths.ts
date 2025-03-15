import dayjs from "dayjs";

export const shiftDateByMonth = (monthsDelta: number) => {
  const currentDate = new Date();
  currentDate.setMonth(currentDate.getMonth() + monthsDelta);
  const formattedDate = dayjs(currentDate).format("YYYY-MM-DD");
  return formattedDate;
};
