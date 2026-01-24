"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, CreditCard, Truck, MapPin, Home, Briefcase, MapPinned, ShoppingBag, X, Check, User as UserIcon, Mail, Phone, Upload, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useCurrency } from "@/hooks/use-currency"

interface CartItem {
  productId: string
  name: string
  slug: string
  image: string
  variant: { size: string; color: string }
  quantity: number
  isCustomized: boolean
  unitPrice: number
  customizationFee: number
}

interface Address {
  _id: string
  type: string
  house: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export function CheckoutForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("razorpay")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [appliedPromo, setAppliedPromo] = useState("")
  const [promoMessage, setPromoMessage] = useState("")
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" })
  const [phoneInput, setPhoneInput] = useState("")
  const [isSavingPhone, setIsSavingPhone] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<any>({
    razorpay: { enabled: true, name: "Pay Online", description: "UPI, Credit/Debit Card, Net Banking & Wallets" },
    cod: { enabled: true, name: "Cash on Delivery", description: "Pay with cash when your order is delivered" }
  })
  const [paymentSettings, setPaymentSettings] = useState<any>(null)
  const [manualPaymentType, setManualPaymentType] = useState<"" | "upi" | "qr">("")
  const [transactionId, setTransactionId] = useState("")
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)
  const { symbol: currencySymbol } = useCurrency()

  const [newAddress, setNewAddress] = useState({
    type: "home",
    house: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  })
  const [useNewAddress, setUseNewAddress] = useState(false)

  useEffect(() => {
    fetchCheckoutData()
    
    // Retrieve promo code from sessionStorage
    const savedPromo = sessionStorage.getItem('appliedPromo')
    if (savedPromo) {
      try {
        const promoData = JSON.parse(savedPromo)
        setAppliedPromo(promoData.code)
        setDiscount(promoData.discount)
        setPromoCode(promoData.code)
      } catch (e) {
        console.error('Error parsing promo data:', e)
      }
    }
  }, [])

  // Revalidate promo code when cart items change
  useEffect(() => {
    if (appliedPromo && cartItems.length > 0) {
      revalidatePromoCode()
    }
  }, [cartItems])

  const revalidatePromoCode = async () => {
    try {
      const orderValue = calculateTotals().subtotal
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: appliedPromo, orderValue }),
      })

      const data = await res.json()

      if (res.ok) {
        // Promo is still valid, update discount if it changed
        setDiscount(data.discount)
        sessionStorage.setItem('appliedPromo', JSON.stringify({
          code: data.code,
          discount: data.discount
        }))
      } else {
        // Promo is no longer valid, remove it
        setDiscount(0)
        setAppliedPromo("")
        setPromoCode("")
        sessionStorage.removeItem('appliedPromo')
        setPromoMessage(`⚠ ${data.error || 'Promo code no longer valid for current cart value'}`)
        setTimeout(() => setPromoMessage(""), 5000)
      }
    } catch (error) {
      console.error("Failed to revalidate promo code:", error)
    }
  }

  const fetchCheckoutData = async () => {
    try {
      const [cartRes, addressRes, profileRes, settingsRes] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/user/addresses"),
        fetch("/api/user/profile"),
        fetch("/api/settings"),
      ])

      if (cartRes.ok) {
        const cartData = await cartRes.json()
        setCartItems(cartData.cart?.items || [])
      }

      if (addressRes.ok) {
        const addressData = await addressRes.json()
        setAddresses(addressData)
        const defaultAddr = addressData.find((addr: Address) => addr.isDefault)
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id)
        }
      }
      
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUserInfo({
          name: profileData.name || "",
          email: profileData.email || "",
          phone: profileData.phone || ""
        })
        setPhoneInput(profileData.phone || "")
      }
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        if (settingsData.settings?.paymentMethods) {
          setPaymentMethods(settingsData.settings.paymentMethods)
          // Set default payment method to first enabled option
          if (settingsData.settings.paymentMethods.razorpay?.enabled) {
            setPaymentMethod("razorpay")
          } else if (settingsData.settings.paymentMethods.cod?.enabled) {
            setPaymentMethod("cod")
          }
        }
      }
      
      // Fetch payment settings for manual payment options
      const paymentSettingsRes = await fetch("/api/payment-settings")
      if (paymentSettingsRes.ok) {
        const paymentSettingsData = await paymentSettingsRes.json()
        setPaymentSettings(paymentSettingsData)
      }
    } catch (error) {
      console.error("Failed to fetch checkout data:", error)
      toast({
        title: "Error",
        description: "Failed to load checkout data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.unitPrice + item.customizationFee) * item.quantity,
      0
    )
    const shipping = 0 // Free shipping
    const total = subtotal + shipping - discount
    return { subtotal, shipping, total }
  }

  const { subtotal, shipping, total } = calculateTotals()

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return

    setApplyingPromo(true)
    setPromoMessage("")

    try {
      const orderValue = subtotal
      const res = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), orderValue }),
      })

      const data = await res.json()

      if (res.ok) {
        setDiscount(data.discount)
        setAppliedPromo(data.code)
        // Store in sessionStorage
        sessionStorage.setItem('appliedPromo', JSON.stringify({
          code: data.code,
          discount: data.discount
        }))
        setPromoMessage(`✓ ${data.discount > 0 ? `${currencySymbol}${data.discount.toFixed(2)} discount applied!` : 'Code applied'}`)
      } else {
        setDiscount(0)
        setAppliedPromo("")
        sessionStorage.removeItem('appliedPromo')
        setPromoMessage(data.error || "Invalid promo code")
      }
    } catch (error) {
      setDiscount(0)
      setAppliedPromo("")
      sessionStorage.removeItem('appliedPromo')
      setPromoMessage("Failed to apply promo code")
    } finally {
      setApplyingPromo(false)
    }
  }

  const removePromoCode = () => {
    setPromoCode("")
    setAppliedPromo("")
    setDiscount(0)
    setPromoMessage("")
    sessionStorage.removeItem('appliedPromo')
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      setPaymentScreenshot(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeScreenshot = () => {
    setPaymentScreenshot(null)
    setScreenshotPreview(null)
  }

  const savePhoneNumber = async () => {
    if (!phoneInput.trim() || phoneInput.length < 10) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      })
      return
    }

    setIsSavingPhone(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userInfo.name, phone: phoneInput, dob: null }),
      })

      if (res.ok) {
        setUserInfo({ ...userInfo, phone: phoneInput })
        toast({
          title: "Success",
          description: "Phone number saved to your profile",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to save phone number",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save phone number",
        variant: "destructive",
      })
    } finally {
      setIsSavingPhone(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    if (!useNewAddress && !selectedAddressId) {
      toast({
        title: "Error",
        description: "Please select a shipping address",
        variant: "destructive",
      })
      return
    }
    
    // Validate phone number
    if (!phoneInput || phoneInput.length < 10) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number to continue",
        variant: "destructive",
      })
      return
    }
    
    // Validate manual payment fields if manual payment is selected
    if (manualPaymentType) {
      if (!transactionId.trim()) {
        toast({
          title: "Payment Information Required",
          description: "Please enter your transaction ID to complete the payment verification process.",
          variant: "destructive",
        })
        return
      }
      if (!paymentScreenshot) {
        toast({
          title: "Payment Proof Required",
          description: "Please upload your payment screenshot to verify the transaction and complete your order.",
          variant: "destructive",
        })
        return
      }
    }
    
    // Validate that payment method is selected and completed
    if (paymentMethod === 'razorpay' && !manualPaymentType) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment option (UPI or QR Code) and complete the payment procedure with required documents.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const shippingAddress = useNewAddress
        ? newAddress
        : addresses.find((addr) => addr._id === selectedAddressId)

      const orderData = {
        items: cartItems,
        shippingAddress,
        paymentMethod: manualPaymentType ? `manual_${manualPaymentType}` : paymentMethod,
        subtotal,
        shipping,
        discount,
        promoCode: appliedPromo,
        total,
      }

      if (paymentMethod === "razorpay" && !manualPaymentType) {
        // Auto Razorpay payment flow
        const res = await fetch("/api/payments/razorpay/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        })

        if (!res.ok) {
          throw new Error("Failed to create payment")
        }

        const data = await res.json()

        // Initialize Razorpay checkout
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: "INR",
          name: "PrintWibe",
          description: "Order Payment",
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            // Verify payment and create order
            const verifyRes = await fetch("/api/orders", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...orderData,
                razorpayOrderId: data.razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })

            if (verifyRes.ok) {
              const orderData = await verifyRes.json()
              // Clear promo code from sessionStorage after successful order
              sessionStorage.removeItem('appliedPromo')
              router.push(`/order-success?orderId=${orderData.orderId}`)
            } else {
              toast({
                title: "Error",
                description: "Payment verification failed",
                variant: "destructive",
              })
            }
          },
          prefill: {
            name: userInfo.name || "",
            email: userInfo.email || "",
            contact: phoneInput || "",
          },
          theme: {
            color: "#1e3a8a",
          },
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
      } else if (manualPaymentType) {
        // Manual payment flow (UPI/QR)
        setUploadingScreenshot(true)
        
        // First create the order to get orderId
        const tempOrderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...orderData,
            manualPaymentDetails: {
              transactionId,
              method: manualPaymentType,
              screenshotUrl: "" // Will be updated after upload
            }
          }),
        })
        
        if (!tempOrderRes.ok) {
          throw new Error("Failed to create order")
        }
        
        const tempOrderData = await tempOrderRes.json()
        
        // Upload payment screenshot
        if (!paymentScreenshot) {
          throw new Error("Payment screenshot is required")
        }
        
        const formData = new FormData()
        formData.append('file', paymentScreenshot)
        formData.append('orderId', tempOrderData.orderId)
        
        const uploadRes = await fetch("/api/upload-payment-screenshot", {
          method: "POST",
          body: formData,
        })
        
        if (!uploadRes.ok) {
          throw new Error("Failed to upload payment screenshot")
        }
        
        const uploadData = await uploadRes.json()
        
        // Update order with screenshot URL
        const updateRes = await fetch(`/api/orders/${tempOrderData.orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            manualPaymentDetails: {
              transactionId,
              method: manualPaymentType,
              screenshotUrl: uploadData.url
            }
          }),
        })
        
        if (updateRes.ok) {
          sessionStorage.removeItem('appliedPromo')
          router.push(`/order-success?orderId=${tempOrderData.orderId}`)
        } else {
          throw new Error("Failed to update order with payment proof")
        }
      } else {
        // COD order
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderData),
        })

        if (res.ok) {
          const data = await res.json()
          // Clear promo code from sessionStorage after successful order
          sessionStorage.removeItem('appliedPromo')
          router.push(`/order-success?orderId=${data.orderId}`)
        } else {
          const data = await res.json()
          toast({
            title: "Error",
            description: data.error || "Failed to place order",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />
      case "work":
        return <Briefcase className="h-4 w-4" />
      default:
        return <MapPinned className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-6">Add some products to checkout</p>
          <Button onClick={() => router.push("/products")}>Browse Products</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader className="border-b py-3 px-6">
              <CardTitle className="text-lg font-semibold">1. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</Label>
                    <p className="text-base font-medium">{userInfo.name || "Not provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</Label>
                    <p className="text-base font-medium truncate">{userInfo.email || "Not provided"}</p>
                  </div>
                </div>
                
                {/* Phone Number Section */}
                <div className="pt-4 border-t space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                    <span>Mobile Number {!userInfo.phone && <span className="text-destructive ml-1">*</span>}</span>
                    {!userInfo.phone && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required for delivery</Badge>
                    )}
                  </Label>
                  
                  {userInfo.phone ? (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="text-base font-medium">{userInfo.phone}</span>
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                          className="flex-1 h-11"
                          maxLength={10}
                          required
                        />
                        <Button
                          type="button"
                          onClick={savePhoneNumber}
                          disabled={isSavingPhone || phoneInput.length < 10}
                          className="h-11 px-6"
                        >
                          {isSavingPhone ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        A verified number helps us contact you about your delivery
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="border-b py-3 px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">2. Delivery Address</CardTitle>
                {addresses.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUseNewAddress(!useNewAddress)}
                    className="text-primary hover:text-primary/80"
                  >
                    {useNewAddress ? "Select Saved" : "+ Add New"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-6">
              <div className="space-y-4">
                {/* Saved Addresses */}
                {addresses.length > 0 && !useNewAddress && (
                  <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <label
                          key={address._id}
                          htmlFor={address._id}
                          className={`flex gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedAddressId === address._id 
                              ? 'border-primary bg-primary/5 shadow-sm' 
                              : 'border-border hover:border-primary/30 hover:bg-muted/20'
                          }`}
                        >
                          <div className="pt-0.5">
                            <RadioGroupItem value={address._id} id={address._id} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize text-xs font-normal">
                                {getAddressIcon(address.type)}
                                <span className="ml-1">{address.type}</span>
                              </Badge>
                              {address.isDefault && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            <div className="space-y-0.5 text-sm">
                              <p className="font-medium text-foreground">{address.house}, {address.street}</p>
                              <p className="text-muted-foreground">{address.city}, {address.state} - {address.postalCode}</p>
                              <p className="text-muted-foreground">{address.country}</p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                )}

                {/* New Address Form */}
                {(useNewAddress || addresses.length === 0) && (
                  <div className="space-y-4">
                    {addresses.length === 0 && (
                      <p className="text-sm text-muted-foreground mb-4">Please add a delivery address</p>
                    )}
                    <div className="space-y-2">
                      <Label>Address Type</Label>
                      <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={newAddress.type === "home" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewAddress({ ...newAddress, type: "home" })}
                      >
                        <Home className="h-3.5 w-3.5 mr-1" />
                        Home
                      </Button>
                      <Button
                        type="button"
                        variant={newAddress.type === "work" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewAddress({ ...newAddress, type: "work" })}
                      >
                        <Briefcase className="h-3.5 w-3.5 mr-1" />
                        Work
                      </Button>
                      <Button
                        type="button"
                        variant={newAddress.type === "other" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setNewAddress({ ...newAddress, type: "other" })}
                      >
                        <MapPinned className="h-3.5 w-3.5 mr-1" />
                        Other
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>House/Flat No. *</Label>
                      <Input
                        value={newAddress.house}
                        onChange={(e) => setNewAddress({ ...newAddress, house: e.target.value })}
                        placeholder="123, Building Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Street/Area *</Label>
                      <Input
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Street name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Input
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        placeholder="Maharashtra"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Postal Code *</Label>
                      <Input
                        value={newAddress.postalCode}
                        onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                        placeholder="400001"
                        required
                      />
                    </div>
                  </div>

                    <div className="space-y-2">
                      <Label>Country *</Label>
                      <Input
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        placeholder="India"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader className="border-b py-3 px-6">
              <CardTitle className="text-lg font-semibold">3. Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  {paymentMethods.razorpay?.enabled && (
                    <label
                      htmlFor="razorpay"
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'razorpay'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-muted/20'
                      }`}
                    >
                      <div className="pt-0.5">
                        <RadioGroupItem value="razorpay" id="razorpay" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{paymentMethods.razorpay.name}</span>
                          </div>
                          <Badge className="text-xs">Recommended</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {paymentMethods.razorpay.description}
                        </p>
                      </div>
                    </label>
                  )}

                  {paymentMethods.cod?.enabled && (
                    <label
                      htmlFor="cod"
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/30 hover:bg-muted/20'
                      }`}
                    >
                      <div className="pt-0.5">
                        <RadioGroupItem value="cod" id="cod" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold mb-1">{paymentMethods.cod.name}</div>
                        <p className="text-xs text-muted-foreground">
                          {paymentMethods.cod.description}
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </RadioGroup>
              
              {/* Manual Payment Options (UPI/QR) */}
              {paymentMethod === 'razorpay' && paymentSettings?.manualPayments && 
               (paymentSettings.manualPayments.upi?.enabled || paymentSettings.manualPayments.qrCode?.enabled) && (
                <div className="mt-6 border-t pt-4">
                  <Label className="text-sm font-medium mb-3 block">Or pay manually</Label>
                  <RadioGroup value={manualPaymentType} onValueChange={(value: any) => setManualPaymentType(value)}>
                    <div className="space-y-3">
                      {/* Clear manual payment selection */}
                      {/* <label
                        htmlFor="auto_razorpay"
                        className={`flex items-start gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                          !manualPaymentType
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className="pt-0.5">
                          <RadioGroupItem value="" id="auto_razorpay" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Automatic Payment</div>
                          <p className="text-xs text-muted-foreground">Use Razorpay gateway (recommended)</p>
                        </div>
                      </label> */}

                      {/* Manual UPI */}
                      {paymentSettings.manualPayments.upi?.enabled && paymentSettings.manualPayments.upi?.upiId && (
                        <label
                          htmlFor="manual_upi"
                          className={`flex items-start gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                            manualPaymentType === 'upi'
                              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                              : 'border-border hover:border-orange-400/30'
                          }`}
                        >
                          <div className="pt-0.5">
                            <RadioGroupItem value="upi" id="manual_upi" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">UPI Payment</div>
                            <p className="text-xs text-muted-foreground">Pay to UPI ID and upload proof</p>
                          </div>
                        </label>
                      )}

                      {/* Manual QR Code */}
                      {paymentSettings.manualPayments.qrCode?.enabled && paymentSettings.manualPayments.qrCode?.qrCodeUrl && (
                        <label
                          htmlFor="manual_qr"
                          className={`flex items-start gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                            manualPaymentType === 'qr'
                              ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20'
                              : 'border-border hover:border-orange-400/30'
                          }`}
                        >
                          <div className="pt-0.5">
                            <RadioGroupItem value="qr" id="manual_qr" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">QR Code Payment</div>
                            <p className="text-xs text-muted-foreground">Scan QR and upload proof</p>
                          </div>
                        </label>
                      )}
                    </div>
                  </RadioGroup>

                  {/* Show payment details based on selection */}
                  {manualPaymentType === 'upi' && paymentSettings.manualPayments.upi?.upiId && (
                    <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Pay to this UPI ID:</Label>
                        <div className="flex items-center gap-2 mt-2 p-3 bg-white dark:bg-gray-900 border rounded-md">
                          <code className="flex-1 text-sm font-mono">{paymentSettings.manualPayments.upi.upiId}</code>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(paymentSettings.manualPayments.upi.upiId)
                              toast({ title: "Copied!", description: "UPI ID copied to clipboard" })
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID *</Label>
                        <Input
                          id="transactionId"
                          placeholder="Enter transaction/reference ID"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentScreenshot">Payment Screenshot *</Label>
                        <p className="text-xs text-muted-foreground">Upload proof of payment (Max 5MB)</p>
                        {screenshotPreview ? (
                          <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                            <Image
                              src={screenshotPreview}
                              alt="Payment Screenshot"
                              fill
                              className="object-contain"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={removeScreenshot}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <Input
                              id="paymentScreenshot"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleScreenshotChange}
                            />
                            <label htmlFor="paymentScreenshot" className="cursor-pointer">
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">Click to upload screenshot</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {manualPaymentType === 'qr' && paymentSettings.manualPayments.qrCode?.qrCodeUrl && (
                    <div className="mt-4 p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg space-y-4">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Scan this QR Code to pay:</Label>
                        <div className="relative w-64 h-64 mx-auto border rounded-lg overflow-hidden bg-white">
                          <Image
                            src={paymentSettings.manualPayments.qrCode.qrCodeUrl}
                            alt="Payment QR Code"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionId">Transaction ID *</Label>
                        <Input
                          id="transactionId"
                          placeholder="Enter transaction/reference ID"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentScreenshot">Payment Screenshot *</Label>
                        <p className="text-xs text-muted-foreground">Upload proof of payment (Max 5MB)</p>
                        {screenshotPreview ? (
                          <div className="relative w-full h-48 border rounded-lg overflow-hidden">
                            <Image
                              src={screenshotPreview}
                              alt="Payment Screenshot"
                              fill
                              className="object-contain"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-2 right-2"
                              onClick={removeScreenshot}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center">
                            <Input
                              id="paymentScreenshot"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleScreenshotChange}
                            />
                            <label htmlFor="paymentScreenshot" className="cursor-pointer">
                              <div className="flex flex-col items-center gap-2">
                                <Upload className="h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">Click to upload screenshot</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant.size} / {item.variant.color}
                      </p>
                      {item.isCustomized && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Custom
                        </Badge>
                      )}
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                        <span className="text-sm font-medium">
                          {currencySymbol}{((item.unitPrice + item.customizationFee) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                  <span>{currencySymbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount ({appliedPromo})</span>
                    <span className="text-green-600 font-medium">-{currencySymbol}{discount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{currencySymbol}{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor="checkout-promo" className="text-sm">
                  Have a Promo Code?
                </Label>
                {appliedPromo ? (
                  <div className="flex items-center gap-2 py-2 px-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <Check className="h-3.5 w-3.5 text-yellow-600" />
                    <span className="flex-1 text-xs font-medium text-yellow-700 dark:text-yellow-500">{appliedPromo}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0.5 text-yellow-600 hover:text-yellow-700"
                      onClick={removePromoCode}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Input
                        id="checkout-promo"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase())
                          setPromoMessage("")
                        }}
                        placeholder="Enter code"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), applyPromoCode())}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applyPromoCode}
                        disabled={!promoCode.trim() || applyingPromo}
                      >
                        {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                      </Button>
                    </div>
                    {promoMessage && (
                      <p
                        className={`text-xs ${
                          promoMessage.startsWith("✓") ? "text-green-600" : "text-destructive"
                        }`}
                      >
                        {promoMessage}
                      </p>
                    )}
                  </>
                )}
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : paymentMethod === "razorpay" ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay {currencySymbol}{total.toFixed(2)}
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
