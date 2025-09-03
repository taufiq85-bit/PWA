// src/components/ui/BaseFormComponents.tsx
import React from 'react'
import {
  UseFormReturn,
  FieldValues,
  Path,
  SubmitHandler,
} from 'react-hook-form'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Base Form Wrapper
interface BaseFormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: SubmitHandler<T>
  children: React.ReactNode
  className?: string
  showErrorSummary?: boolean
}

export function BaseForm<T extends FieldValues>({
  form,
  onSubmit,
  children,
  className,
  showErrorSummary = false,
}: BaseFormProps<T>) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {showErrorSummary && Object.keys(form.formState.errors).length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm font-medium text-red-800 mb-2">
              Mohon perbaiki kesalahan berikut:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700">
              {Object.entries(form.formState.errors).map(([key, error]) => (
                <li key={key}>{String(error?.message || '')}</li>
              ))}
            </ul>
          </div>
        )}
        {children}
      </form>
    </Form>
  )
}

// Form Input Component
interface FormInputProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  description?: string
  className?: string
}

export function FormInput<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  description,
  className,
}: FormInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(form.formState.errors[name] && 'border-red-500')}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Form Select Component
interface FormSelectProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  placeholder?: string
  options: { value: string; label: string }[]
  required?: boolean
  disabled?: boolean
  description?: string
  className?: string
}

export function FormSelect<T extends FieldValues>({
  form,
  name,
  label,
  placeholder = 'Pilih...',
  options,
  required = false,
  disabled = false,
  description,
  className,
}: FormSelectProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={cn(form.formState.errors[name] && 'border-red-500')}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

// Form Checkbox Component
interface FormCheckboxProps<T extends FieldValues> {
  form: UseFormReturn<T>
  name: Path<T>
  label: string
  description?: string
  className?: string
}

export function FormCheckbox<T extends FieldValues>({
  form,
  name,
  label,
  description,
  className,
}: FormCheckboxProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-row items-start space-x-3 space-y-0',
            className
          )}
        >
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="cursor-pointer">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}

// Form Submit Button
interface FormSubmitButtonProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
}

export function FormSubmitButton({
  children,
  loading = false,
  disabled = false,
  className,
  variant = 'default',
}: FormSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      className={className}
      variant={variant}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
