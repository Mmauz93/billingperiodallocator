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

import { FormValues } from "./types";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "@/translations";

interface LocaleSelectProps {
  form: UseFormReturn<FormValues>;
}

export function LocaleSelect({ form }: LocaleSelectProps) {
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name="locale"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t("SettingsModal.localeLabel")}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={t("SettingsModal.localePlaceholder")}
                />
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
  );
}
