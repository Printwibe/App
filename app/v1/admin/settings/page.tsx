"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, AlertCircle, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "",
    adminEmail: "",
    supportEmail: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    businessHours: "",
    aboutUs: "",
    shippingCost: "0",
    taxRate: "0",
    currency: "USD",
    paymentMethods: {
      razorpay: {
        enabled: true,
        name: "Pay Online",
        description: "UPI, Credit/Debit Card, Net Banking & Wallets"
      },
      cod: {
        enabled: true,
        name: "Cash on Delivery",
        description: "Pay with cash when your order is delivered"
      }
    },
    socialMedia: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/v1/admin/settings")
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      setSettings({
        ...data.settings,
        shippingCost: String(data.settings.shippingCost || 0),
        taxRate: String(data.settings.taxRate || 0),
        paymentMethods: data.settings.paymentMethods || {
          razorpay: {
            enabled: true,
            name: "Pay Online",
            description: "UPI, Credit/Debit Card, Net Banking & Wallets"
          },
          cod: {
            enabled: true,
            name: "Cash on Delivery",
            description: "Pay with cash when your order is delivered"
          }
        },
        socialMedia: data.settings.socialMedia || {
          facebook: "",
          twitter: "",
          instagram: "",
          linkedin: "",
        },
      })
    } catch (error) {
      console.error("Error fetching settings:", error)
      setErrorMessage("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }


  const handleSocialMediaChange = (platform: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value,
      },
    }))
  }
  
  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const response = await fetch("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...settings,
          shippingCost: parseFloat(settings.shippingCost) || 0,
          taxRate: parseFloat(settings.taxRate) || 0,
        }),
      })

      if (!response.ok) throw new Error("Failed to save settings")

      setSuccessMessage("Settings saved successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
      setErrorMessage("Failed to save settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store settings</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2 text-sm text-green-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Basic store details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Store Name</label>
              <Input name="storeName" value={settings.storeName} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Admin Email</label>
              <Input name="adminEmail" type="email" value={settings.adminEmail} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Support Email</label>
              <Input name="supportEmail" type="email" value={settings.supportEmail} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input name="phone" value={settings.phone} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Store location and hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <Input name="address" value={settings.address} onChange={handleInputChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input name="city" value={settings.city} onChange={handleInputChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Input name="state" value={settings.state} onChange={handleInputChange} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Business Hours</label>
              <Input name="businessHours" value={settings.businessHours} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>Postal code, country, and currency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Postal Code</label>
              <Input name="postalCode" value={settings.postalCode} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <Input name="country" value={settings.country} onChange={handleInputChange} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <Input name="currency" value={settings.currency} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Settings</CardTitle>
            <CardDescription>Default shipping and tax rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Shipping Cost ($)</label>
              <Input
                name="shippingCost"
                type="number"
                step="0.01"
                value={settings.shippingCost}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <Input name="taxRate" type="number" step="0.1" value={settings.taxRate} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        {/* About Store */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About Your Store</CardTitle>
            <CardDescription>Description displayed on website</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">About Us</label>
              <Textarea name="aboutUs" value={settings.aboutUs} onChange={handleInputChange} rows={4} />
            </div>
          </CardContent>
        </Card>

        {/* Social Media Links */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Links to your social media profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Facebook URL</label>
                <Input
                  value={settings.socialMedia.facebook}
                  onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Twitter URL</label>
                <Input
                  value={settings.socialMedia.twitter}
                  onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instagram URL</label>
                <Input
                  value={settings.socialMedia.instagram}
                  onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn URL</label>
                <Input
                  value={settings.socialMedia.linkedin}
                  onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
