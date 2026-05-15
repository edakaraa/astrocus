// [GÖREV 3] — Dil, kutlama ve onboarding görüldü bilgisi UIContext’e taşındı

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { asyncStorage } from "../shared/storage";
import { STORAGE_KEYS } from "../shared/constants";
import { api } from "../shared/api";
import { Language } from "../shared/types";
import { useAuth } from "./AuthContext";
import type { AstrocusInfraRefs } from "./AuthContext";

export type CelebrationState = {
  stardustEarned: number;
  unlockedStarId: string | null;
  galacticAdvice?: string;
} | null;

export type UIContextValue = {
  language: Language;
  celebration: CelebrationState;
  onboardingSeen: boolean;
  setLanguage: (language: Language) => Promise<void>;
  triggerCelebration: (state: CelebrationState) => void;
  dismissCelebration: () => void;
  setOnboardingSeen: (seen: boolean) => Promise<void>;
};

const UIContext = createContext<UIContextValue | null>(null);

type UIProviderProps = PropsWithChildren<Pick<AstrocusInfraRefs, "uiSetLanguageRef" | "uiSetCelebrationRef">>;

export const UIProvider = ({ children, uiSetLanguageRef, uiSetCelebrationRef }: UIProviderProps) => {
  const { token, applyAuthPayload, setIsOnline } = useAuth();
  const [language, setLanguageState] = useState<Language>("tr");
  const [celebration, setCelebration] = useState<CelebrationState>(null);
  const [onboardingSeen, setOnboardingSeenState] = useState(false);

  useLayoutEffect(() => {
    uiSetLanguageRef.current = (nextLanguage) => {
      setLanguageState(nextLanguage);
    };
    uiSetCelebrationRef.current = (next) => {
      setCelebration(next);
    };
    return () => {
      uiSetLanguageRef.current = null;
      uiSetCelebrationRef.current = null;
    };
  }, [uiSetCelebrationRef, uiSetLanguageRef]);

  useEffect(() => {
    const load = async () => {
      const seen = await asyncStorage.get<boolean>(STORAGE_KEYS.onboardingSeen, false);
      setOnboardingSeenState(seen);
    };
    void load();
  }, []);

  const setLanguage = useCallback(
    async (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      await asyncStorage.set(STORAGE_KEYS.language, nextLanguage);

      if (token) {
        try {
          const payload = await api.updateProfile(token, { language: nextLanguage });
          await applyAuthPayload(payload);
        } catch {
          setIsOnline(false);
        }
      }
    },
    [applyAuthPayload, setIsOnline, token],
  );

  const triggerCelebration = useCallback((state: CelebrationState) => {
    setCelebration(state);
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const setOnboardingSeen = useCallback(async (seen: boolean) => {
    setOnboardingSeenState(seen);
    await asyncStorage.set(STORAGE_KEYS.onboardingSeen, seen);
  }, []);

  const value = useMemo<UIContextValue>(
    () => ({
      language,
      celebration,
      onboardingSeen,
      setLanguage,
      triggerCelebration,
      dismissCelebration,
      setOnboardingSeen,
    }),
    [celebration, dismissCelebration, language, onboardingSeen, setLanguage, setOnboardingSeen, triggerCelebration],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = (): UIContextValue => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
};
