'use client';

import { AppSettings, useSettings } from "@/context/settings-context";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { useEffect, useState } from 'react';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from 'react-i18next';

interface SettingsModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

interface ExtendedSettings extends Omit<AppSettings, 'locale'> {
    locale?: string;
}

export function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
    const { settings, saveSettings } = useSettings();
    const { t, i18n } = useTranslation();
    const [currentSettings, setCurrentSettings] = useState<Partial<ExtendedSettings>>({
        ...settings,
        locale: i18n.language
    });

    useEffect(() => {
        setCurrentSettings({
            ...settings,
            locale: i18n.language
        });
    }, [settings, i18n.language]);

    const handleSave = () => {
        // Parse decimalPlaces
        let decimalPlacesToSave: number;
        const currentDecimalPlaces = currentSettings.decimalPlaces;
        if (typeof currentDecimalPlaces === 'string' && currentDecimalPlaces !== '') {
            const parsed = parseInt(currentDecimalPlaces, 10);
            decimalPlacesToSave = isNaN(parsed) || parsed < 0 || parsed > 6 ? settings.decimalPlaces : parsed;
        } else if (typeof currentDecimalPlaces === 'number') {
            decimalPlacesToSave = currentDecimalPlaces < 0 || currentDecimalPlaces > 6 ? settings.decimalPlaces : currentDecimalPlaces;
        } else {
            decimalPlacesToSave = settings.decimalPlaces;
        }

        // Parse roundingPrecision
        let roundingPrecisionToSave: number;
        const currentRoundingPrecision = currentSettings.roundingPrecision;
        if (typeof currentRoundingPrecision === 'string' && currentRoundingPrecision !== '') {
            const parsed = parseFloat(currentRoundingPrecision);
            roundingPrecisionToSave = isNaN(parsed) || parsed <= 0 ? settings.roundingPrecision : parsed;
        } else if (typeof currentRoundingPrecision === 'number') {
            roundingPrecisionToSave = currentRoundingPrecision <= 0 ? settings.roundingPrecision : currentRoundingPrecision;
        } else {
            roundingPrecisionToSave = settings.roundingPrecision;
        }

        // Save app settings (without locale)
        const settingsToSave = {
            decimalPlaces: decimalPlacesToSave,
            roundingPrecision: roundingPrecisionToSave,
            thousandsSeparator: currentSettings.thousandsSeparator ?? settings.thousandsSeparator,
        };

        // Handle the locale/language change separately
        const newLocale = currentSettings.locale;
        if (newLocale && i18n.language !== newLocale) {
            i18n.changeLanguage(newLocale);
        }

        saveSettings(settingsToSave);
        onOpenChange(false);
    };
    
    const handleDecimalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        if (rawValue === '' || /^\d*$/.test(rawValue)) {
            const numValue = parseInt(rawValue, 10);
            if (rawValue === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= 6)) {
                setCurrentSettings(prev => ({ 
                    ...prev, 
                    decimalPlaces: rawValue === '' ? 2 : numValue 
                }));
            } else if (!isNaN(numValue) && numValue > 6) {
                setCurrentSettings(prev => ({ 
                    ...prev, 
                    decimalPlaces: 6
                }));
            }
        }
    };

    const handleRoundingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = event.target.value;
        if (rawValue === '' || /^\d*\.?\d*$/.test(rawValue)) {
            const numValue = parseFloat(rawValue);
            setCurrentSettings(prev => ({ 
                ...prev, 
                roundingPrecision: rawValue === '' ? 0.01 : (isNaN(numValue) ? 0.01 : numValue)
            }));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[360px] p-5">
                <DialogHeader className="pb-2">
                    <DialogTitle className="text-center">{t('SettingsModal.title')}</DialogTitle>
                    <DialogDescription className="text-center">
                        {t('Accessibility.settingsDescription')}
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 py-1">
                    {/* Thousands Separator */}
                    <div className="flex items-center">
                        <div className="w-32 text-right pr-3">
                            <Label htmlFor="thousandsSeparator" className="inline-block">
                                {t('SettingsModal.useApostropheSeparatorLabel')}
                            </Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="thousandsSeparator"
                                checked={currentSettings.thousandsSeparator === 'apostrophe'}
                                onCheckedChange={(checked) => {
                                    const newValue = checked ? 'apostrophe' : 'comma-period';
                                    setCurrentSettings(prev => ({ ...prev, thousandsSeparator: newValue }));
                                }}
                            />
                            <span className="text-xs text-muted-foreground">
                                {t('SettingsModal.useApostropheSeparatorDescription')}
                            </span>
                        </div>
                    </div>
                    
                    {/* Decimal Places */}
                    <div className="flex items-center">
                        <div className="w-32 text-right pr-3">
                            <Label htmlFor="decimalPlaces" className="inline-block">
                                {t('SettingsModal.decimalPlacesLabel')}
                            </Label>
                        </div>
                        <Input 
                            id="decimalPlaces"
                            type="number"
                            min="0"
                            max="6"
                            value={String(currentSettings.decimalPlaces ?? '')}
                            onChange={handleDecimalChange}
                            className="w-20 h-8 text-sm"
                        />
                    </div>
                    
                    {/* Rounding Precision */}
                    <div className="flex items-center">
                        <div className="w-32 text-right pr-3">
                            <Label htmlFor="roundingPrecision" className="inline-block">
                                {t('SettingsModal.roundingPrecisionLabel')}
                            </Label>
                        </div>
                        <Input 
                            id="roundingPrecision"
                            type="number"
                            step="any"
                            min="0"
                            value={String(currentSettings.roundingPrecision ?? '')}
                            onChange={handleRoundingChange}
                            className="w-20 h-8 text-sm"
                        />
                    </div>
                </div>
                
                <DialogFooter className="pt-3 space-x-2">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="flex-1">{t('SettingsModal.closeButton')}</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleSave} className="flex-1">{t('SettingsModal.saveButton')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 
