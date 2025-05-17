"use client";

import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { FormValues } from "./types";
import { Input } from "@/components/ui/input";

interface NumberFieldProps {
  form: UseFormReturn<FormValues>;
  name: "decimalPlaces" | "roundingPrecision";
  label: string;
  description: string;
}

export function NumberField({
  form,
  name,
  label,
  description,
}: NumberFieldProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }: { field: ControllerRenderProps<FormValues, "decimalPlaces" | "roundingPrecision"> }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input required {...field} />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
