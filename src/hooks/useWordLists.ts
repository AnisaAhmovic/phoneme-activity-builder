"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchWordLists, getErrorMessage } from "@/lib/activityApi";
import type { StoredWordList } from "@/types/backend";

export function useWordLists() {
  const [wordLists, setWordLists] = useState<StoredWordList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const refresh = useCallback(async (): Promise<StoredWordList[]> => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const nextWordLists = await fetchWordLists();
      setWordLists(nextWordLists);
      return nextWordLists;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadWordLists(): Promise<void> {
      try {
        const nextWordLists = await fetchWordLists();

        if (isCurrent) {
          setWordLists(nextWordLists);
          setErrorMessage("");
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadWordLists();

    return () => {
      isCurrent = false;
    };
  }, []);

  return {
    wordLists,
    isLoading,
    errorMessage,
    refresh,
  };
}
