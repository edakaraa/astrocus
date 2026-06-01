export const getDateKey = (value: string) => new Date(value).toLocaleDateString("en-CA");

export const isSameLocalCalendarDay = (value: string | Date, reference = new Date()): boolean => {
  const d = typeof value === "string" ? new Date(value) : value;
  return (
    d.getFullYear() === reference.getFullYear() &&
    d.getMonth() === reference.getMonth() &&
    d.getDate() === reference.getDate()
  );
};
