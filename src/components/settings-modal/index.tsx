"use client";

import {
  DEFAULT_SEPARATOR,
  validateDecimalPlaces,
  validateRoundingPrecision,
} from "./form-schema";
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
  FormSchema,
  FormValues,
  SettingsModalProps
} from "./types";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { LocaleSelect } from "./locale-select";
import { NumberField } from "./number-field";
import { SeparatorSelect } from "./separator-select";
import { Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSettings } from "@/context/settings-context";
import { useTranslation } from "@/translations";
import { zodResolver } from "@hookform/resolvers/zod";

export function SettingsModal({
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  variant = "ghost",
  size = "icon",
  className,
}: SettingsModalProps) {
  const { settings, saveSettings } = useSettings();
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Use either the external state or internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const onOpenChange = externalOnOpenChange || setInternalIsOpen;

  // Track form validity state
  const [isValid, setIsValid] = useState(true);

  // Fix the form type to match form values
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      decimalPlaces: settings.decimalPlaces?.toString() || "",
      roundingPrecision: settings.roundingPrecision?.toString() || "0.01",
      thousandsSeparator: settings.thousandsSeparator || DEFAULT_SEPARATOR,
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
        thousandsSeparator: settings.thousandsSeparator || DEFAULT_SEPARATOR,
        locale: "en-US",
      });
    }
  }, [isOpen, settings, form]);

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
        thousandsSeparator: settings.thousandsSeparator || DEFAULT_SEPARATOR,
        locale: "en-US",
      });
    }
    onOpenChange(open);
  };

  function onSubmit(data: FormValues) {
    // Validate decimal places
    const decimalPlacesResult = validateDecimalPlaces(data.decimalPlaces);
    if (!decimalPlacesResult.valid) {
      form.setError("decimalPlaces", {
        type: "manual",
        message: decimalPlacesResult.message || "Invalid decimal places",
      });
      return;
    }

    // Validate rounding precision
    const roundingPrecisionResult = validateRoundingPrecision(
      data.roundingPrecision,
    );
    if (!roundingPrecisionResult.valid) {
      form.setError("roundingPrecision", {
        type: "manual",
        message:
          roundingPrecisionResult.message || "Invalid rounding precision",
      });
      return;
    }

    // Only save settings when user submits the form and all validations pass
    const updatedSettings = {
      decimalPlaces: Number(data.decimalPlaces),
      roundingPrecision: Number(data.roundingPrecision.replace(",", ".")),
      thousandsSeparator: data.thousandsSeparator || DEFAULT_SEPARATOR,
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
  const currentSeparator =
    form.watch("thousandsSeparator") || DEFAULT_SEPARATOR;

  // Determine labels based on mounted state
  const triggerLabel = isMounted
    ? t("SettingsModal.settingsModalTitle")
    : "Number Formatting Settings";
  const dialogTitle = isMounted
    ? t("SettingsModal.settingsModalTitle")
    : "Number Formatting Settings";
  const dialogDescription = isMounted
    ? t("SettingsModal.settingsModalDescription")
    : "Adjust your preferred number formatting for allocations and reports.";
  const saveLabel = isMounted ? t("SettingsModal.saveButton") : "Save Settings";
  const cancelLabel = isMounted
    ? t("SettingsModal.cancelButton", "Cancel")
    : "Cancel";

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
              <NumberField
                form={form}
                name="decimalPlaces"
                label={t("SettingsModal.decimalPlacesLabel")}
                description={t("SettingsModal.decimalPlacesDescription")}
              />

              <NumberField
                form={form}
                name="roundingPrecision"
                label={t("SettingsModal.roundingPrecisionLabel")}
                description={t("SettingsModal.roundingPrecisionDescription")}
              />

              <SeparatorSelect
                form={form}
                currentSeparator={currentSeparator}
              />

              <LocaleSelect form={form} />

              <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    {cancelLabel}
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={!isValid}
                  className="w-full sm:w-auto"
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
