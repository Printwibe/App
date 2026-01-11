"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save, AlertCircle } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "PrintWibe",
    adminEmail: "admin@printwibe.com",
    supportEmail: "support@printwibe.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main Street, San Francisco, CA 94105",
    city: "San Francisco",
    state: "CA",
    country: "United States",
    postalCode: "94105",
    businessHours: "Monday - Friday: 9:00 AM - 6:00 PM",
    aboutUs: "PrintWibe is a leading print-on-demand platform offering custom merchandise.",
    shippingCost: "15.00",
    taxRate: "8.5",
    currency: "USD",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // API call to save settings
      // await fetch('/api/v1/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // })
      setSuccessMessage("Settings saved successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsSaving(false)
    }
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
