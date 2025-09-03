// src/components/forms/FormField.tsx
import React from 'react'
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  name: string
  label?: string
  description?: string
  placeholder?: string
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'number'
    | 'tel'
    | 'url'
    | 'textarea'
    | 'select'
    | 'checkbox'
  required?: boolean
  disabled?: boolean
  className?: string
  options?: { value: string; label: string }[]
  field?: any // From react-hook-form
}

export const FormFieldComponent: React.FC<FormFieldProps> = ({
  name,
  label,
  description,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  className,
  options = [],
  field,
}) => {
  return (
    <FormItem className={className}>
      {label && (
        <FormLabel htmlFor={name}>
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
      )}
      <FormControl>
        {type === 'textarea' ? (
          <Textarea
            id={name}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            className={cn('resize-none', field?.className)}
          />
        ) : type === 'select' ? (
          <Select
            disabled={disabled}
            value={field?.value}
            onValueChange={field?.onChange}
          >
            <SelectTrigger id={name}>
              <SelectValue placeholder={placeholder || 'Pilih...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : type === 'checkbox' ? (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field?.value}
              onCheckedChange={field?.onChange}
              disabled={disabled}
            />
            {placeholder && (
              <label
                htmlFor={name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {placeholder}
              </label>
            )}
          </div>
        ) : (
          <Input
            id={name}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            className={cn(field?.className)}
          />
        )}
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  )
}
