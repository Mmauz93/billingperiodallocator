'use client';

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';

export type Locale = 'en' | 'de';

export type AppSettings = {
    decimalPlaces: number;       // 0-6
    roundingPrecision: number; // e.g., 0.01, 0.05, 1
    thousandsSeparator: string; // Values: ',', '.', "'", ' '
};

interface SettingsContextProps {
    settings: Omit<AppSettings, 'locale'>;
    saveSettings: (newSettings: Partial<Omit<AppSettings, 'locale'>>) => void; // Allow partial updates
}

const defaultSettings: Omit<AppSettings, 'locale'> = {
    decimalPlaces: 2, // Default decimal places
    roundingPrecision: 0.01, // Default rounding
    thousandsSeparator: ",", // Default separator is comma
};

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<Omit<AppSettings, 'locale'>>(() => {
        const loadedSettings = typeof window !== 'undefined' ? localStorage.getItem('appSettings') : null;
        const initialSettings = loadedSettings ? JSON.parse(loadedSettings) : {};
        // Remove locale if it exists in loaded settings
        if ('locale' in initialSettings) {
            delete initialSettings.locale;
        }
        return { ...defaultSettings, ...initialSettings }; // Merge defaults with loaded
    });
    const [isLoaded, setIsLoaded] = useState(false); // Flag to ensure localStorage is read only once

    // Effect to load settings from localStorage on initial client mount
    useEffect(() => {
        if (typeof window !== 'undefined' && !isLoaded) { // Check if running on client and not already loaded
            try {
                const savedSettings = localStorage.getItem('appSettings');
                if (savedSettings) {
                    const parsed = JSON.parse(savedSettings);
                    // Remove locale before validation/setting
                    if ('locale' in parsed) {
                         delete parsed.locale;
                    }
                    
                    if (
                        typeof parsed.decimalPlaces === 'number' &&
                        typeof parsed.roundingPrecision === 'number' && 
                        parsed.roundingPrecision > 0 &&
                        (typeof parsed.thousandsSeparator === 'string' &&
                         [',', '.', "'", ' '].includes(parsed.thousandsSeparator)) // Accept all valid separators
                    ) {
                         setSettings(prev => ({ ...defaultSettings, ...prev, ...parsed })); // Ensure defaults are applied
                    } else {
                        console.warn("Loaded settings from localStorage are invalid or incomplete (excluding locale). Using defaults.");
                         // Set merged defaults if loaded is bad
                         setSettings(defaultSettings);
                         localStorage.removeItem('appSettings'); // Clear invalid storage
                    }
                }
                 else {
                    setSettings(defaultSettings); // Ensure defaults if nothing is loaded
                 }
            } catch (error) {
                console.error("Failed to load settings from localStorage:", error);
                setSettings(defaultSettings); // Fallback to defaults on error
            }
            setIsLoaded(true); // Mark as loaded to prevent re-running
        }
    }, [isLoaded]); // Dependency array ensures it runs once after initial mount

    // Save settings to localStorage whenever they change
    const saveSettings = (newSettings: Partial<Omit<AppSettings, 'locale'>>) => {
        if (typeof window !== 'undefined') { // Ensure running on client
            try {
                // Create a clean copy without any potential 'locale' property
                const cleanSettings = { 
                    ...(newSettings.decimalPlaces !== undefined && { decimalPlaces: newSettings.decimalPlaces }),
                    ...(newSettings.roundingPrecision !== undefined && { roundingPrecision: newSettings.roundingPrecision }),
                    ...(newSettings.thousandsSeparator !== undefined && { thousandsSeparator: newSettings.thousandsSeparator })
                };
                
                const updatedSettings = { ...settings, ...cleanSettings };
                setSettings(updatedSettings);
                
                // Save to localStorage
                localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
            } catch (error) {
                console.error("Failed to save settings to localStorage:", error);
            }
        }
    };

    // The direct useEffect sync might cause issues with initial load, rely on saveSettings
    // useEffect(() => { ... }, [settings]); // Remove this redundant effect

    return (
        // Pass down saveSettings instead of raw setSettings
        <SettingsContext.Provider value={{ settings, saveSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextProps => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}; 
