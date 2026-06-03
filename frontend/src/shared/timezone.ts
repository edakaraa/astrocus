/** Device IANA timezone for date-bound goals and analytics. */
export const getDeviceTimeZone = (): string =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
