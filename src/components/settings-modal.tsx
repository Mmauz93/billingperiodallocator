"use client";

import * as z from "zod";

import {
  Dialog,
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
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
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
      locale: i18n.language || "en-US",
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
        locale: i18n.language || "en-US",
      });
    }
  }, [isOpen, settings, i18n.language, form, defaultSeparator]);

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
        locale: i18n.language || "en-US",
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
    if (newLocale && i18n.language !== newLocale) {
      i18n.changeLanguage(newLocale);
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
                        <SelectItem value=",">
                          {t("SettingsModal.comma")} (1,234.56)
                        </SelectItem>
                        <SelectItem value=".">
                          {t("SettingsModal.period")} (1.234,56)
                        </SelectItem>
                        <SelectItem value="'">
                          {t("SettingsModal.apostrophe")} (1&apos;234.56)
                        </SelectItem>
                        <SelectItem value=" ">
                          {t("SettingsModal.space")} (1 234.56)
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
              <DialogFooter className="pt-4">
                <Button
                  type="submit"
                  disabled={
                    !isValid ||
                    form.formState.isSubmitting ||
                    Object.keys(form.formState.errors).length > 0
                  }
                >
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
