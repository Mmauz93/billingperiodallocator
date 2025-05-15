"use client";

import * as z from "zod";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription as UiDialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React from "react";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "@/translations";
import { zodResolver } from "@hookform/resolvers/zod";

// Define a simpler form schema without transforms to avoid type issues
const FormSchema = z.object({
  decimalPlaces: z.string().nonempty("Decimal places is required"),
  roundingPrecision: z.string().nonempty("Rounding precision is required"),
  thousandsSeparator: z.string(),
  locale: z.string(),
});

// Our form is typed based on this schema
type FormValues = z.infer<typeof FormSchema>;

interface SettingsModalProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}

export function SettingsModal({ 
  isOpen: externalIsOpen, 
  onOpenChange: externalOnOpenChange,
  variant = "ghost",
  size = "icon",
  className
}: SettingsModalProps) {
  const { settings, saveSettings } = useSettings();
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use either the external state or internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onOpenChange = externalOnOpenChange || setInternalIsOpen;

  // Always ensure there's a default separator
  const defaultSeparator = ",";

  // Track form validity state
  const [isValid, setIsValid] = useState(true);

  // Fix the form type to match form values
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      decimalPlaces: settings.decimalPlaces?.toString() || "",
      roundingPrecision: settings.roundingPrecision?.toString() || "0.01",
      thousandsSeparator: settings.thousandsSeparator || defaultSeparator,
      locale: "en-US",
    },
    mode: "onChange", // Validate on every change
  });

  // Reset form when dialog opens or settings change
  useEffect(() => {
    if (isOpen) {
      // Ensure we're using the latest settings from context
      form.reset({
        decimalPlaces: settings.decimalPlaces?.toString() || "",
        roundingPrecision: settings.roundingPrecision?.toString() || "0.01",
        thousandsSeparator: settings.thousandsSeparator || defaultSeparator,
        locale: "en-US",
      });
    }
  }, [isOpen, settings, form, defaultSeparator]);

  // Update isValid when form state changes
  useEffect(() => {
    const subscription = form.watch(() => {
      const hasErrors = !!Object.keys(form.formState.errors).length;
      const formValues = form.getValues();
      const isDecimalEmpty =
        !formValues.decimalPlaces || formValues.decimalPlaces === "";

      setIsValid(!hasErrors && !isDecimalEmpty);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    setIsMounted(true);
  }, [settings]);

  // Handle dialog close - ensure unsaved changes are discarded
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog is closed without saving
      form.reset({
        decimalPlaces: settings.decimalPlaces?.toString() || "",
        roundingPrecision: settings.roundingPrecision?.toString() || "0.01",
        thousandsSeparator: settings.thousandsSeparator || defaultSeparator,
        locale: "en-US",
      });
    }
    onOpenChange(open);
  };

  function onSubmit(data: FormValues) {
    // Validate decimal places
    const decimalPlaces = Number(data.decimalPlaces);
    if (isNaN(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 6) {
      form.setError("decimalPlaces", {
        type: "manual",
        message: "Decimal places must be between 0 and 6",
      });
      return;
    }

    // Validate rounding precision
    const normalized = data.roundingPrecision.replace(",", ".");
    const roundingPrecision = Number(normalized);
    if (
      isNaN(roundingPrecision) ||
      roundingPrecision < 0.0001 ||
      roundingPrecision > 100
    ) {
      form.setError("roundingPrecision", {
        type: "manual",
        message: "Rounding precision must be between 0.0001 and 100",
      });
      return;
    }

    // Only save settings when user submits the form and all validations pass
    const updatedSettings = {
      decimalPlaces: decimalPlaces,
      roundingPrecision: roundingPrecision,
      thousandsSeparator: data.thousandsSeparator || defaultSeparator,
      locale: data.locale,
    };

    // Handle the locale/language change
    const newLocale = data.locale;
    if (newLocale && "en-US" !== newLocale) {
      // Implement language change logic here
    }

    // Save all settings at once after form submission
    saveSettings(updatedSettings);

    // Dispatch a custom event to notify the application that settings have changed
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("settingsChanged", {
          detail: { settings: updatedSettings },
        }),
      );
    }

    onOpenChange(false);
  }

  // Always ensure we have a valid separator value for the dropdown
  const currentSeparator = form.watch("thousandsSeparator") || defaultSeparator;

  // Determine labels based on mounted state
  const triggerLabel = isMounted ? t("SettingsModal.settingsModalTitle") : "Number Formatting Settings";
  const dialogTitle = isMounted ? t("SettingsModal.settingsModalTitle") : "Number Formatting Settings";
  const dialogDescription = isMounted ? t("SettingsModal.settingsModalDescription") : "Adjust your preferred number formatting for allocations and reports.";
  const saveLabel = isMounted ? t("SettingsModal.saveButton") : "Save Settings";
  const cancelLabel = isMounted ? t("SettingsModal.cancelButton", "Cancel") : "Cancel";

  return (
    <>
      {!externalIsOpen && !externalOnOpenChange && (
        <Button
          variant={variant}
          size={size}
          onClick={() => setInternalIsOpen(true)}
          className={className}
          aria-label={triggerLabel}
        >
          <Settings className="size-4" />
          {size !== "icon" && t("SettingsModal.settingsButtonText", "Settings")}
        </Button>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <UiDialogDescription>{dialogDescription}</UiDialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="decimalPlaces"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("SettingsModal.decimalPlacesLabel")}</FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormDescription>
                      {t("SettingsModal.decimalPlacesDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roundingPrecision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("SettingsModal.roundingPrecisionLabel")}
                    </FormLabel>
                    <FormControl>
                      <Input required {...field} />
                    </FormControl>
                    <FormDescription>
                      {t("SettingsModal.roundingPrecisionDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="thousandsSeparator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("SettingsModal.thousandsSeparatorLabel")}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value || defaultSeparator);
                      }}
                      value={currentSeparator}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>
                            {currentSeparator === ","
                              ? `${t("SettingsModal.comma")} (1,234.56)`
                              : currentSeparator === "."
                                ? `${t("SettingsModal.period")} (1.234,56)`
                                : currentSeparator === "'"
                                  ? `${t("SettingsModal.apostrophe")} (1&apos;234.56)`
                                  : currentSeparator === " "
                                    ? `${t("SettingsModal.space")} (1 234.56)`
                                    : t("SettingsModal.comma")}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem key="," value=",">
                          {`${t("SettingsModal.comma")} (1,234.56)`}
                        </SelectItem>
                        <SelectItem key="." value=".">
                          {`${t("SettingsModal.period")} (1.234,56)`}
                        </SelectItem>
                        <SelectItem key="'" value="'">
                          {`${t("SettingsModal.apostrophe")} (1&apos;234.56)`}
                        </SelectItem>
                        <SelectItem key="space" value=" ">
                          {`${t("SettingsModal.space")} (1 234.56)`}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("SettingsModal.thousandsSeparatorDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("SettingsModal.localeLabel")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("SettingsModal.localePlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en-US">English (United States)</SelectItem>
                        <SelectItem value="de-DE">Deutsch (Deutschland)</SelectItem>
                        {/* Add other locales as needed */}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("SettingsModal.localeDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    {cancelLabel}
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={!isValid} className="w-full sm:w-auto">
                  {saveLabel}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
