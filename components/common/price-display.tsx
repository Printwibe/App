"use client"

import { useCurrency } from "@/hooks/use-currency"

interface PriceDisplayProps {
  amount: number
  className?: string
  showCustomizationPrice?: boolean
  customizationAmount?: number
}

export function PriceDisplay({ 
  amount, 
  className = "", 
  showCustomizationPrice = false,
  customizationAmount = 0 
}: PriceDisplayProps) {
  const { format } = useCurrency()

  return (
    <div className={className}>
      <span className="font-semibold">{format(amount)}</span>
      {showCustomizationPrice && customizationAmount > 0 && (
        <span className="text-xs text-muted-foreground ml-1">
          +{format(customizationAmount)} custom
        </span>
      )}
    </div>
  )
}
