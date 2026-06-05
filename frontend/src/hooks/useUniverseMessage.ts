import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Language } from "../shared/types";

const QUOTE_COUNT = 60;
export const DEFAULT_UNIVERSE_MESSAGE_ORDER_INDEX = 1;

type QuoteRow = {
  text_en: string;
  text_tr: string;
  author: string;
  order_index: number;
};

type UniverseMessage = {
  text: string;
  author: string;
};

type CacheEntry = {
  cacheKey: string;
  row: QuoteRow;
};

let memoryCache: CacheEntry | null = null;

const toLocalDate = (value: string | Date): Date => {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getUniverseMessageOrderIndex = (
  registrationDate: string | Date,
  at: Date = new Date(),
): number => {
  const registered = toLocalDate(registrationDate);
  const today = toLocalDate(at);
  const dayIndex = Math.max(0, Math.floor((today.getTime() - registered.getTime()) / 86_400_000));
  return (dayIndex % QUOTE_COUNT) + 1;
};

const mapQuote = (row: QuoteRow, language: Language): UniverseMessage => ({
  text: language === "tr" ? row.text_tr : row.text_en,
  author: row.author,
});

const resolveOrderIndex = async (): Promise<{ orderIndex: number; cacheKey: string }> => {
  const { data, error } = await supabase.auth.getUser();

  if (error && __DEV__) {
    console.warn("[useUniverseMessage] auth.getUser:", error.message);
  }

  const user = data.user;
  if (!user?.created_at) {
    return {
      orderIndex: DEFAULT_UNIVERSE_MESSAGE_ORDER_INDEX,
      cacheKey: `anon:${DEFAULT_UNIVERSE_MESSAGE_ORDER_INDEX}`,
    };
  }

  const orderIndex = getUniverseMessageOrderIndex(user.created_at);
  return { orderIndex, cacheKey: `${user.id}:${orderIndex}` };
};

export function useUniverseMessage(language: Language) {
  const [message, setMessage] = useState<UniverseMessage | null>(() =>
    memoryCache ? mapQuote(memoryCache.row, language) : null,
  );
  const [loading, setLoading] = useState(() => memoryCache === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (memoryCache) {
      setMessage(mapQuote(memoryCache.row, language));
    }
  }, [language]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);

      const { orderIndex, cacheKey } = await resolveOrderIndex();

      if (cancelled) {
        return;
      }

      if (memoryCache?.cacheKey === cacheKey) {
        setMessage(mapQuote(memoryCache.row, language));
        setLoading(false);
        setError(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("quotes")
        .select("text_en, text_tr, author, order_index")
        .eq("order_index", orderIndex)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (fetchError || !data) {
        if (fetchError && __DEV__) {
          console.warn("[useUniverseMessage]", fetchError.message);
        }
        setMessage(null);
        setError(true);
        setLoading(false);
        return;
      }

      const row = data as QuoteRow;
      memoryCache = { cacheKey, row };
      setMessage(mapQuote(row, language));
      setLoading(false);
      setError(false);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [language]);

  return { text: message?.text ?? null, author: message?.author ?? null, loading, error };
}
