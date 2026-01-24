"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Save, AlertCircle, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

interface PaymentSettings {
  razorpay: {
    enabled: boolean
    name: string
    description: string
  }
  cod: {
    enabled: boolean
    name: string
    description: string
  }
  manualPayments?: {
    upi: {
      enabled: boolean
      upiId?: string
    }
    qrCode: {
      enabled: boolean
      qrCodeUrl?: string
    }
  }
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentSettings>({
    razorpay: {
      enabled: true,
      name: "Pay Online",
      description: "UPI, Credit/Debit Card, Net Banking & Wallets"
    },
    cod: {
      enabled: true,
      name: "Cash on Delivery",
      description: "Pay with cash when your order is delivered"
    },
    manualPayments: {
      upi: { enabled: false, upiId: "" },
      qrCode: { enabled: false, qrCodeUrl: "" }
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // Fetch both settings APIs
      const [settingsRes, paymentSettingsRes] = await Promise.all([
        fetch("/api/v1/admin/settings"),
        fetch("/api/v1/admin/payment-settings")
      ])
      
      if (settingsRes.ok) {
        const data = await settingsRes.json()
        if (data.settings?.paymentMethods) {
          setPaymentMethods(prev => ({
            ...prev,
            razorpay: data.settings.paymentMethods.razorpay || prev.razorpay,
            cod: data.settings.paymentMethods.cod || prev.cod
          }))
        }
      }
      
      if (paymentSettingsRes.ok) {
        const paymentData = await paymentSettingsRes.json()
        if (paymentData.manualPayments) {
          setPaymentMethods(prev => ({
            ...prev,
            manualPayments: paymentData.manualPayments
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error)
      setErrorMessage("Failed to load payment methods")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentMethodChange = (method: string, field: string, value: any) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: {
        ...prev[method as keyof typeof prev],
        [field]: value,
      },
    }))
  }
  
  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/v1/admin/upload-qr", {
        method: "POST",
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      setPaymentMethods(prev => ({
        ...prev,
        manualPayments: {
          ...prev.manualPayments!,
          qrCode: {
            ...prev.manualPayments!.qrCode,
            qrCodeUrl: data.url
          }
        }
      }))

      setSuccessMessage("QR code uploaded successfully")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to upload QR code")
      setTimeout(() => setErrorMessage(""), 5000)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      // Save to both APIs
      const [settingsRes, paymentSettingsRes] = await Promise.all([
        // Save razorpay and cod to settings API
        (async () => {
          const getResponse = await fetch("/api/v1/admin/settings")
          if (!getResponse.ok) throw new Error("Failed to fetch current settings")
          const currentData = await getResponse.json()

          return fetch("/api/v1/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ...currentData.settings,
              paymentMethods: {
                razorpay: paymentMethods.razorpay,
                cod: paymentMethods.cod
              },
            }),
          })
        })(),
        
        // Save manual payments to payment-settings API
        fetch("/api/v1/admin/payment-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay: paymentMethods.razorpay,
            cod: paymentMethods.cod,
            manualPayments: paymentMethods.manualPayments
          })
        })
      ])

      if (!settingsRes.ok || !paymentSettingsRes.ok) {
        throw new Error("Failed to save payment methods")
      }

      setSuccessMessage("Payment methods saved successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Failed to save payment methods:", error)
      setErrorMessage("Failed to save payment methods. Please try again.")
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
        <h1 className="font-serif text-3xl font-medium">Payment Methods</h1>
        <p className="text-muted-foreground mt-1">Manage payment options available to customers</p>
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

      <div className="max-w-4xl space-y-6">
        {/* Online Payment (Razorpay) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Online Payment (Razorpay)</CardTitle>
                <CardDescription>Accept payments through UPI, cards, net banking, and wallets</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${paymentMethods.razorpay.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {paymentMethods.razorpay.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.razorpay.enabled}
                    onChange={(e) => handlePaymentMethodChange('razorpay', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <Input
                value={paymentMethods.razorpay.name}
                onChange={(e) => handlePaymentMethodChange('razorpay', 'name', e.target.value)}
                placeholder="Pay Online"
                disabled={!paymentMethods.razorpay.enabled}
              />
              <p className="text-xs text-muted-foreground mt-1">This name will be shown to customers at checkout</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                value={paymentMethods.razorpay.description}
                onChange={(e) => handlePaymentMethodChange('razorpay', 'description', e.target.value)}
                placeholder="UPI, Credit/Debit Card, Net Banking & Wallets"
                disabled={!paymentMethods.razorpay.enabled}
              />
              <p className="text-xs text-muted-foreground mt-1">Brief description of available payment options</p>
            </div>
            
            {paymentMethods.razorpay.enabled && (
              <>
                <Separator className="my-4" />
                
                <div>
                  <h3 className="font-semibold text-sm mb-2">Manual Payment Verification</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Allow customers to pay via UPI/QR and upload payment proof for manual verification
                  </p>
                  
                  {/* Manual UPI */}
                  <div className="border rounded-lg p-4 space-y-3 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">UPI Payment</Label>
                        <p className="text-xs text-muted-foreground">Customers pay to your UPI ID</p>
                      </div>
                      <Switch
                        checked={paymentMethods.manualPayments?.upi.enabled || false}
                        onCheckedChange={(checked) =>
                          setPaymentMethods(prev => ({
                            ...prev,
                            manualPayments: {
                              ...prev.manualPayments!,
                              upi: { ...prev.manualPayments!.upi, enabled: checked }
                            }
                          }))
                        }
                      />
                    </div>
                    {paymentMethods.manualPayments?.upi.enabled && (
                      <div className="space-y-2 pt-2">
                        <Label htmlFor="upiId">Your UPI ID</Label>
                        <Input
                          id="upiId"
                          placeholder="yourname@paytm"
                          value={paymentMethods.manualPayments?.upi.upiId || ""}
                          onChange={(e) =>
                            setPaymentMethods(prev => ({
                              ...prev,
                              manualPayments: {
                                ...prev.manualPayments!,
                                upi: { ...prev.manualPayments!.upi, upiId: e.target.value }
                              }
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Manual QR Code */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">QR Code Payment</Label>
                        <p className="text-xs text-muted-foreground">Customers scan QR to pay</p>
                      </div>
                      <Switch
                        checked={paymentMethods.manualPayments?.qrCode.enabled || false}
                        onCheckedChange={(checked) =>
                          setPaymentMethods(prev => ({
                            ...prev,
                            manualPayments: {
                              ...prev.manualPayments!,
                              qrCode: { ...prev.manualPayments!.qrCode, enabled: checked }
                            }
                          }))
                        }
                      />
                    </div>
                    {paymentMethods.manualPayments?.qrCode.enabled && (
                      <div className="space-y-3 pt-2">
                        <Label htmlFor="qrCode">Payment QR Code</Label>
                        <p className="text-xs text-muted-foreground">Upload your UPI/payment QR code image</p>
                        
                        {paymentMethods.manualPayments?.qrCode.qrCodeUrl ? (
                          <div className="relative w-64 h-64 border rounded-lg overflow-hidden">
                            <Image
                              src={paymentMethods.manualPayments.qrCode.qrCodeUrl}
                              alt="QR Code"
                              fill
                              className="object-contain"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={() =>
                                setPaymentMethods(prev => ({
                                  ...prev,
                                  manualPayments: {
                                    ...prev.manualPayments!,
                                    qrCode: { ...prev.manualPayments!.qrCode, qrCodeUrl: "" }
                                  }
                                }))
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-8 text-center">
                            <Input
                              id="qrCode"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleQRUpload}
                              disabled={uploading}
                            />
                            <label htmlFor="qrCode" className="cursor-pointer">
                              <div className="flex flex-col items-center gap-2">
                                {uploading ? (
                                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                                ) : (
                                  <Upload className="h-10 w-10 text-muted-foreground" />
                                )}
                                <p className="text-sm font-medium">
                                  {uploading ? "Uploading..." : "Click to upload QR code"}
                                </p>
                                <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Cash on Delivery */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cash on Delivery (COD)</CardTitle>
                <CardDescription>Allow customers to pay with cash upon delivery</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${paymentMethods.cod.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {paymentMethods.cod.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentMethods.cod.enabled}
                    onChange={(e) => handlePaymentMethodChange('cod', 'enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Display Name</label>
              <Input
                value={paymentMethods.cod.name}
                onChange={(e) => handlePaymentMethodChange('cod', 'name', e.target.value)}
                placeholder="Cash on Delivery"
                disabled={!paymentMethods.cod.enabled}
              />
              <p className="text-xs text-muted-foreground mt-1">This name will be shown to customers at checkout</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                value={paymentMethods.cod.description}
                onChange={(e) => handlePaymentMethodChange('cod', 'description', e.target.value)}
                placeholder="Pay with cash when your order is delivered"
                disabled={!paymentMethods.cod.enabled}
              />
              <p className="text-xs text-muted-foreground mt-1">Brief description of this payment method</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end max-w-4xl">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
