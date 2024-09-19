import { differenceInDays } from "date-fns";

export const getFormattedDateDifference = (maxWeightDate: Date): string => {
  const today = new Date();
  const daysDifference = differenceInDays(today, maxWeightDate);

  if (daysDifference === 0) {
    return "today";
  } else {
    return `${daysDifference} day${daysDifference > 1 ? "s" : ""} ago`;
  }
};
