"use client";

import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { ControllerRenderProps } from "react-hook-form";
import { FormSchemaType } from "./form-schema";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/translations";
import { validateAmount } from "./form-validators";

interface AmountFieldProps {
  index: number;
  field: ControllerRenderProps<FormSchemaType, `amounts.${number}.value`>;
  canRemove: boolean;
  onRemoveAction: () => void;
  hasError: boolean;
  errorMessage?: string;
}

export function AmountField({
  index,
  field,
  canRemove,
  onRemoveAction,
  hasError,
  errorMessage,
}: AmountFieldProps) {
  const { t } = useTranslation();
  
  // Use the validation function from form-validators
  const validation = validateAmount(field.value, t, index);
  const isValid = validation.valid;

  return (
    <FormItem className="mb-3">
      <div className="flex flex-col gap-1">
        <FormLabel htmlFor={`amount-${index}`} className="text-sm font-medium">
          #{index + 1}
        </FormLabel>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FormControl>
              <Input
                type="number"
                step="any"
                className="focus:border-primary focus:ring-2 focus:ring-primary/20 transition-transform duration-150 pr-8"
                {...field}
                id={`amount-${index}`}
                name={`amounts.${index}.value`}
              />
            </FormControl>
            <div className="absolute right-2 top-0 h-full flex items-center justify-center z-[1]">
              {isValid && (
                <div className="flex items-center justify-center h-5 w-5">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
              )}
              {hasError && (
                <div className="flex items-center justify-center h-5 w-5">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                </div>
              )}
            </div>
          </div>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onRemoveAction}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-all duration-200 shrink-0"
              aria-label="Remove amount"
            >
              <XCircle className="h-4 w-4 transition-transform duration-150 hover:scale-95" />
            </Button>
          )}
        </div>
      </div>
      {hasError && errorMessage && (
        <FormMessage className="text-xs mt-1 error-message">
          {errorMessage}
        </FormMessage>
      )}
    </FormItem>
  );
}
