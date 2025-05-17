"use client";

import {
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

import { DEFAULT_SEPARATOR } from "./form-schema";
import { FormValues } from "./types";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/translations";

interface SeparatorSelectProps {
  form: UseFormReturn<FormValues>;
  currentSeparator: string;
}

export function SeparatorSelect({
  form,
  currentSeparator,
}: SeparatorSelectProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name="thousandsSeparator"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("SettingsModal.thousandsSeparatorLabel")}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value || DEFAULT_SEPARATOR);
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
  );
}
