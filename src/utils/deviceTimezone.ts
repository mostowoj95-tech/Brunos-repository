import * as Localization from "expo-localization";

export function getDeviceTimezone(): string {
  const [calendar] = Localization.getCalendars();
  return calendar?.timeZone ?? "UTC";
}
