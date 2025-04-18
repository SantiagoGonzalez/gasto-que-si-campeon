"use client"

import type React from "react"
import { useState, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string
  onChange: (value: string) => void
  error?: boolean
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, error, ...props }, ref) => {
    const [rawValue, setRawValue] = useState(value) // Store unformatted value

    const formatCurrency = (amount: string) => {
      const numericValue = Number(amount)
      if (isNaN(numericValue)) return ""
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let input = e.target.value.replace(/[^0-9.]/g, "")

      // Ensure valid number format
      const parts = input.split(".")
      if (parts.length > 2) {
        input = parts[0] + "." + parts.slice(1).join("")
      }

      setRawValue(input) // Store unformatted input
      onChange(input) // Pass unformatted value to parent
    }

    const handleBlur = () => {
      if (rawValue) {
        setRawValue(formatCurrency(rawValue)) // Format only when losing focus
      }
    }

    const handleFocus = () => {
      setRawValue(value) // Show raw number while editing
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={rawValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className={cn(error && "border-red-500 focus-visible:ring-red-500", className)}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = "CurrencyInput"

