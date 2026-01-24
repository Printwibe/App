"use client"

import { useEffect, useState } from "react"

export interface PublicSettings {
  storeName: string
  supportEmail: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  businessHours: string
  aboutUs: string
  currency: string
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  policies?: {
    termsOfService?: string
    privacyPolicy?: string
    returnPolicy?: string
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<PublicSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (!response.ok) throw new Error("Failed to fetch settings")
        const data = await response.json()
        setSettings(data.settings)
      } catch (err) {
        console.error("Error fetching settings:", err)
        setError("Failed to load settings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, isLoading, error }
}
