import React, { type ComponentProps } from "react";
import { AppCard } from "./AppCard";

export type CardProps = Omit<ComponentProps<typeof AppCard>, "variant" | "contentPadding" | "borderVariant">;

/** @see AppCard — `variant="card"` */
export const Card: React.FC<CardProps> = (props) => <AppCard variant="card" {...props} />;
