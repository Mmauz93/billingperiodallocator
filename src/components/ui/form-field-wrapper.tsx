/**
 * FormFieldWrapper Component
 * 
 * A wrapper component for form fields that provides consistent accessibility features
 * and error handling for form inputs.
 */

import { ControllerFieldState, ControllerRenderProps, Path, UseFormReturn } from 'react-hook-form';
import {
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from './form';
import React, { useId } from 'react';

import { useAnnouncer } from './announcer';

interface FormFieldWrapperProps<T extends Record<string, unknown>> {
  name: Path<T>;
  control: UseFormReturn<T>['control'];
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode | ((props: { 
    field: ControllerRenderProps<T, Path<T>>; 
    id: string;
    invalid: boolean;
  }) => React.ReactNode);
}

// Internal component to handle the field content and announcements
function FieldContent<T extends Record<string, unknown>>({
  field,
  fieldState,
  id, 
  label,
  description,
  required,
  className,
  children,
  announce
}: {
  field: ControllerRenderProps<T, Path<T>>;
  fieldState: ControllerFieldState;
  id: string;
  label: string;
  description?: string;
  required: boolean;
  className?: string;
  children: FormFieldWrapperProps<T>['children'];
  announce: (message: string, type: 'polite' | 'assertive') => void;
}) {
  const isInvalid = !!fieldState.error;
  
  // Announce errors to screen readers
  React.useEffect(() => {
    if (fieldState.error?.message) {
      announce(`Error in field ${label}: ${fieldState.error.message}`, 'assertive');
    }
  }, [fieldState.error, announce, label]);
  
  return (
    <FormItem className={className}>
      <FormLabel 
        htmlFor={id}
        className={isInvalid ? 'text-destructive' : ''}
        aria-required={required}
      >
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-destructive">*</span>}
      </FormLabel>
      
      {typeof children === 'function' 
        ? children({ field, id, invalid: isInvalid })
        : React.cloneElement(children as React.ReactElement, {
            ...field,
            id,
            'aria-invalid': isInvalid,
            'aria-describedby': `${id}-description ${id}-error`,
          } as React.HTMLAttributes<HTMLElement>)}
      
      {description && (
        <FormDescription id={`${id}-description`}>
          {description}
        </FormDescription>
      )}
      
      <FormMessage id={`${id}-error`} />
    </FormItem>
  );
}

// Add displayName for the component
FieldContent.displayName = 'FieldContent';

export function FormFieldWrapper<T extends Record<string, unknown>>({
  name,
  control,
  label,
  description,
  required = false,
  className,
  children,
}: FormFieldWrapperProps<T>) {
  const uniqueId = useId();
  const { announce } = useAnnouncer();
  
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FieldContent<T>
          field={field}
          fieldState={fieldState}
          id={`${name}-${uniqueId}`}
          label={label}
          description={description}
          required={required}
          className={className}
          announce={announce}
        >
          {children}
        </FieldContent>
      )}
    />
  );
} 
