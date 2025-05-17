"use client";

import React, { createContext, useEffect, useMemo, useState } from "react";
import {
  SupportedLanguage,
  changeLanguage,
  getCurrentLanguage,
  getLanguageFromPath,
  initializeLanguage,
} from "@/lib/language-service";

import { t as globalT } from "@/translations";
import { usePathname } from "next/navigation";

interface ITranslationContext {
  language: SupportedLanguage;
  t: typeof globalT;
  changeLanguage: typeof changeLanguage;
}

const defaultContextValue: ITranslationContext = {
  language: "en",
  t: (
    key: string,
    optionsOrDefaultValue?: Parameters<typeof globalT>[1],
  ): string => {
    const optionsAsObject =
      typeof optionsOrDefaultValue === "object"
        ? optionsOrDefaultValue
        : undefined;
    const defaultValueAsString =
      typeof optionsOrDefaultValue === "string"
        ? optionsOrDefaultValue
        : undefined;

    if (optionsAsObject?.defaultValue) {
      return optionsAsObject.defaultValue;
    }
    if (defaultValueAsString) {
      return defaultValueAsString;
    }
    return key;
  },
  changeLanguage: () => false,
};

export const TranslationContext =
  createContext<ITranslationContext>(defaultContextValue);

export default function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";

  const pathLanguage = getLanguageFromPath(pathname);

  const [contextLang, setContextLang] = useState<SupportedLanguage>(
    pathLanguage || getCurrentLanguage(),
  );

  useEffect(() => {
    if (pathLanguage) {
      initializeLanguage(pathLanguage);
      setContextLang(pathLanguage);
    } else {
      const detectedLang = getCurrentLanguage();
      setContextLang(detectedLang);
    }
  }, [pathLanguage]);

  useEffect(() => {
    if (pathLanguage && pathLanguage !== contextLang) {
      initializeLanguage(pathLanguage);
      setContextLang(pathLanguage);
    }
  }, [pathname, contextLang, pathLanguage]);

  useEffect(() => {
    const handleLanguageChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newLang = customEvent.detail?.language as SupportedLanguage;

      if (newLang && newLang !== contextLang) {
        setContextLang(newLang);
      }
    };

    document.addEventListener("languageChanged", handleLanguageChanged);
    return () => {
      document.removeEventListener("languageChanged", handleLanguageChanged);
    };
  }, [contextLang]);

  const handleChangeLanguage = (lang: SupportedLanguage): boolean => {
    return changeLanguage(lang, { navigate: true });
  };

  const providerValue = useMemo(
    () => ({
      language: contextLang,
      t: globalT,
      changeLanguage: handleChangeLanguage,
    }),
    [contextLang],
  );

  return (
    <TranslationContext.Provider value={providerValue}>
      {children}
    </TranslationContext.Provider>
  );
}
