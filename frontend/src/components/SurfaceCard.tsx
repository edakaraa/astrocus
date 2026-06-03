import React, { type ComponentProps } from "react";
import { AppCard } from "./ui/AppCard";

export type SurfaceCardProps = Omit<
  ComponentProps<typeof AppCard>,
  "variant" | "radius" | "padding"
>;

/** @see AppCard — `variant="surface"` */
export const SurfaceCard: React.FC<SurfaceCardProps> = (props) => (
  <AppCard variant="surface" {...props} />
);
