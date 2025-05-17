"use client";

import { AlertCircle, CalendarIcon, CheckCircle } from "lucide-react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FormSchemaType, tryParseDate } from "./form-schema";
import { Locale, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";

interface DateFieldProps {
  fieldName: "startDateString" | "endDateString";
  label: string;
  placeholder: string;
  field: ControllerRenderProps<FormSchemaType, "startDateString" | "endDateString">;
  form: UseFormReturn<FormSchemaType>;
  onFieldChangeAction: (e: React.ChangeEvent<HTMLInputElement>) => void;
  displayDateFormat: string;
  locale: Locale;
  disabled?: (date: Date) => boolean;
  autoFocus?: boolean;
}

export function DateField({
  fieldName,
  label,
  placeholder,
  field,
  form,
  onFieldChangeAction,
  displayDateFormat,
  locale,
  disabled,
  autoFocus,
}: DateFieldProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const currentMonth =
    tryParseDate(field.value ?? "") ||
    (fieldName === "endDateString"
      ? tryParseDate(form.getValues("startDateString") ?? "")
      : undefined) ||
    new Date();

  const onSelectDate = (date: Date | undefined) => {
    if (date) {
      const formatted = format(date, displayDateFormat);
      form.setValue(fieldName, formatted, { shouldValidate: true });
    }
    setIsPopoverOpen(false);
  };

  useEffect(() => {
    return () => {
      setIsPopoverOpen(false);
    };
  }, []);

  return (
    <FormItem className="flex flex-col">
      <FormLabel htmlFor={fieldName}>{label}</FormLabel>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <FormControl>
          <div className="w-full relative">
            <Input
              value={field.value}
              onChange={(e) => {
                field.onChange(e);
                onFieldChangeAction(e);
              }}
              onBlur={() => form.trigger(fieldName)}
              placeholder={placeholder}
              className={`w-full pr-16 ${form.formState.errors[fieldName] ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/20" : ""}`}
              autoFocus={autoFocus}
              id={fieldName}
              name={fieldName}
            />
            {field.value && !form.formState.errors[fieldName] && (
              <div className="absolute inset-y-0 right-12 flex items-center z-[1]">
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            )}
            {form.formState.errors[fieldName] && (
              <div className="absolute inset-y-0 right-12 flex items-center z-[1]">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
            )}
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center z-[1]">
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-7 w-7 p-0 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer"
                  aria-label="Pick a date"
                >
                  <CalendarIcon className="h-4 w-4 transition-colors duration-200" />
                </Button>
              </PopoverTrigger>
            </div>
          </div>
        </FormControl>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={tryParseDate(field.value ?? "") || undefined}
            onSelect={onSelectDate}
            initialFocus
            locale={locale}
            defaultMonth={currentMonth}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
      <FormMessage className="text-xs mt-1 error-message">
        {form.formState.errors[fieldName]?.message as string}
      </FormMessage>
    </FormItem>
  );
}
