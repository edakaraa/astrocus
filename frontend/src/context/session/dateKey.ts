// [GÖREV 3] — app-context altından session modülüne taşındı

export const getDateKey = (value: string) => new Date(value).toLocaleDateString("en-CA");
