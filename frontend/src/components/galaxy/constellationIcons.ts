import { getBadgeIcon } from "../badges/badgeIcons";
import type { AppIconName } from "../../shared/appIcons";

export const getConstellationIcon = (constellationId: string): AppIconName =>
  getBadgeIcon(`cst_${constellationId}`).icon;
