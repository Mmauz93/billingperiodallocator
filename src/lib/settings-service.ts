"use client";

import { Locale } from "@/context/settings-context";
import { safeJsonParse } from "./utils";

export type AppSettings = {
  decimalPlaces: number; // 0-6
  roundingPrecision: number; // e.g., 0.01, 0.05, 1
  thousandsSeparator: string; // Values: ',', '.', "'", ' '
  locale?: Locale; // Optional to keep backward compatibility
};

// Storage key constants
export const SETTINGS_STORAGE_KEY = "appSettings";

// Default settings
export const DEFAULT_SETTINGS: Omit<AppSettings, "locale"> = {
  decimalPlaces: 2,
  roundingPrecision: 0.01,
  thousandsSeparator: ",",
};

/**
 * Load settings from localStorage
 * @returns The loaded settings merged with defaults
 */
export function loadSettings(): Omit<AppSettings, "locale"> {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!savedSettings) {
      return DEFAULT_SETTINGS;
    }

    const parsed = safeJsonParse<AppSettings>(savedSettings, {} as AppSettings);
    
    // Remove locale if it exists (handled by language-service now)
    if ("locale" in parsed) {
      delete parsed.locale;
    }

    // Validate the settings
    if (
      typeof parsed.decimalPlaces === "number" &&
      typeof parsed.roundingPrecision === "number" &&
      parsed.roundingPrecision > 0 &&
      typeof parsed.thousandsSeparator === "string" &&
      [",", ".", "'", " "].includes(parsed.thousandsSeparator)
    ) {
      return { ...DEFAULT_SETTINGS, ...parsed };
    } else {
      console.warn(
        "Loaded settings from localStorage are invalid or incomplete. Using defaults."
      );
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 * @param settings The settings to save
 */
export function saveSettings(settings: Partial<Omit<AppSettings, "locale">>): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Get current settings first
    const currentSettings = loadSettings();
    
    // Create a clean copy without any potential 'locale' property
    const cleanSettings = {
      ...(settings.decimalPlaces !== undefined && {
        decimalPlaces: settings.decimalPlaces,
      }),
      ...(settings.roundingPrecision !== undefined && {
        roundingPrecision: settings.roundingPrecision,
      }),
      ...(settings.thousandsSeparator !== undefined && {
        thousandsSeparator: settings.thousandsSeparator,
      }),
    };

    const updatedSettings = { ...currentSettings, ...cleanSettings };
    
    // Save to localStorage
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
    
    return;
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
}

/**
 * Clear all settings and reset to defaults
 */
export function resetSettings(): void {
  if (typeof window === "undefined") {
    return;
  }
  
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to reset settings:", error);
  }
} 
