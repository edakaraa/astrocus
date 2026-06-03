import React, { type PropsWithChildren } from "react";
import { CosmicScreenBackground } from "../CosmicScreenBackground";

/**
 * Stack sub-screens (settings, badges, legal): session starfield backdrop.
 * Top bar lives inside each screen's scroll surface so it scrolls away.
 */
export const SubScreenScaffold: React.FC<PropsWithChildren> = ({ children }) => (
  <CosmicScreenBackground>{children}</CosmicScreenBackground>
);
