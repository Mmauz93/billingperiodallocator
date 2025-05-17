"use client";

import {
  DEFAULT_SETTINGS,
  AppSettings as ServiceAppSettings,
  loadSettings,
  saveSettings as saveSettingsToStorage
} from "@/lib/settings-service";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type Locale = "en" | "de";

// Re-export the AppSettings type for consistency
export type AppSettings = Omit<ServiceAppSettings, "locale"> & { locale?: Locale };

interface SettingsContextProps {
  settings: Omit<AppSettings, "locale">;
  saveSettings: (newSettings: Partial<Omit<AppSettings, "locale">>) => void; // Allow partial updates
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Omit<AppSettings, "locale">>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false); // Flag to ensure localStorage is read only once

  // Effect to load settings from localStorage on initial client mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isLoaded) {
      // Load settings using the settings service
      const loadedSettings = loadSettings();
      setSettings(loadedSettings);
      setIsLoaded(true); // Mark as loaded to prevent re-running
    }
  }, [isLoaded]); // Dependency array ensures it runs once after initial mount

  // Save settings to localStorage whenever they change
  const saveSettings = (newSettings: Partial<Omit<AppSettings, "locale">>) => {
    if (typeof window !== "undefined") {
      // Ensure running on client
      try {
        // Update context state with new settings
        const updatedSettings = { ...settings, ...newSettings };
        setSettings(updatedSettings);
        
        // Save to localStorage using the settings service
        saveSettingsToStorage(newSettings);
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextProps => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
