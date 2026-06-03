import React from "react";
import { StarDustChip } from "./ui/StarDustChip";

type StardustPillProps = {
  amount: number;
};

/** @deprecated Use `StarDustChip` inside `TabScreenTopBar` instead. */
export const StardustPill = ({ amount }: StardustPillProps) => <StarDustChip amount={amount} />;
