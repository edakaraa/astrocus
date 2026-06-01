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
import { resolveInitialLanguage } from "../shared/resolveLanguage";
import type { CelebrationPayload, Language } from "../shared/types";
import { useAuth } from "./AuthContext";
import type { AstrocusInfraRefs } from "./AuthContext";

export type CelebrationState = CelebrationPayload;

export type UIContextValue = {
  language: Language;
  celebration: CelebrationState;
  setLanguage: (language: Language) => Promise<void>;
  dismissCelebration: () => void;
};

const UIContext = createContext<UIContextValue | null>(null);

type UIProviderProps = PropsWithChildren<
  Pick<AstrocusInfraRefs, "uiSetLanguageRef" | "uiSetCelebrationRef" | "uiPatchCelebrationRef">
>;

export const UIProvider = ({
  children,
  uiSetLanguageRef,
  uiSetCelebrationRef,
  uiPatchCelebrationRef,
}: UIProviderProps) => {
  const { token, applyAuthPayload, setIsOnline } = useAuth();
  const [language, setLanguageState] = useState<Language>("tr");
  const [celebration, setCelebration] = useState<CelebrationState>(null);

  useEffect(() => {
    void resolveInitialLanguage().then((resolved) => {
      setLanguageState(resolved);
      uiSetLanguageRef.current?.(resolved);
    });
  }, [uiSetLanguageRef]);

  const patchCelebration = useCallback((patch: Partial<NonNullable<CelebrationPayload>>) => {
    setCelebration((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  useLayoutEffect(() => {
    uiSetLanguageRef.current = setLanguageState;
    uiSetCelebrationRef.current = setCelebration;
    uiPatchCelebrationRef.current = patchCelebration;
    return () => {
      uiSetLanguageRef.current = null;
      uiSetCelebrationRef.current = null;
      uiPatchCelebrationRef.current = null;
    };
  }, [patchCelebration, uiPatchCelebrationRef, uiSetCelebrationRef, uiSetLanguageRef]);

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

  const dismissCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const value = useMemo<UIContextValue>(
    () => ({
      language,
      celebration,
      setLanguage,
      dismissCelebration,
    }),
    [celebration, dismissCelebration, language, setLanguage],
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
