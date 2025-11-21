export const toISODate = (date: Date | string): string => {
  return (typeof date === "string" ? new Date(date) : date).toISOString();
};

export const addDays = (date: Date | string, days: number): string => {
  const base = typeof date === "string" ? new Date(date) : new Date(date.getTime());
  base.setDate(base.getDate() + days);
  return base.toISOString();
};

export const daysBetween = (start: Date | string, end: Date | string): number => {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};
export const isPastDate = (date: Date | string): boolean => {
  const target = typeof date === "string" ? new Date(date) : date;
  return target.getTime() < Date.now();
};

