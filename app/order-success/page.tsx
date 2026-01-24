"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Package,
  ArrowRight,
  MapPin,
  CreditCard,
  Loader2,
  Download,
  Sparkles,
  Clock,
  Home,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/hooks/use-currency";
import { Separator } from "@/components/ui/separator";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { symbol: currencySymbol } = useCurrency();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      router.push("/products");
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`/api/user/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);

        // Clear customization data from sessionStorage after successful order
        if (typeof window !== "undefined" && window.sessionStorage) {
          // Clear all customization-related data
          const keysToRemove = [
            "customization-data",
            "editing-cart-item-index",
            "cart-status",
          ];
          keysToRemove.forEach((key) => {
            sessionStorage.removeItem(key);
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasCustomizedItems = order?.items?.some(
    (item: any) => item.isCustomized
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/10">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="container mx-auto max-w-5xl space-y-8">
          {/* Success Hero Section */}
          <div className="text-center space-y-6 py-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500">
                <CheckCircle
                  className="h-14 w-14 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Sparkles className="h-5 w-5 text-yellow-900" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                Order Placed Successfully!
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Thank you for your purchase! We're excited to create your{" "}
                {hasCustomizedItems && "custom "}products. You'll receive a
                confirmation email shortly.
              </p>
            </div>

            <Card className="inline-block border-2 border-green-200 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Order Number
                </p>
                <p className="font-mono font-bold text-lg text-green-600">
                  {orderId}
                </p>
              </CardContent>
            </Card>
          </div>

          {order && (
            <>
              {/* Custom Design Alert */}
              {hasCustomizedItems && (
                <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          Custom Design Order
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Your custom designs have been submitted to our
                          production team. We'll review your artwork and start
                          production within 24 hours.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Production starts in 24h
                          </Badge>
                          <Badge variant="secondary">
                            Quality Check Included
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Order Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order Status & Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Order Placed</p>
                        <p className="text-xs text-muted-foreground">
                          Just now
                        </p>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {hasCustomizedItems ? "Production" : "Processing"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hasCustomizedItems ? "1-2 days" : "0-1 day"}
                        </p>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Shipped</p>
                        <p className="text-xs text-muted-foreground">
                          {hasCustomizedItems ? "3-4 days" : "2-3 days"}
                        </p>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Home className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Delivered</p>
                        <p className="text-xs text-muted-foreground">
                          {hasCustomizedItems ? "5-7 days" : "3-5 days"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Order Status
                      </p>
                      <Badge variant="default" className="text-sm px-3 py-1">
                        {order.orderStatus || "Processing"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <CreditCard className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Payment Method
                      </p>
                      <p className="font-semibold">
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Paid Online"}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {order.paymentStatus || "Pending"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <Clock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Estimated Delivery
                      </p>
                      <p className="font-semibold">
                        {hasCustomizedItems ? "5-7" : "3-5"} Business Days
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Items ({order.items?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items?.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex gap-4 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
                        >
                          <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted shrink-0">
                            <Image
                              src={item.productImage || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                            {item.isCustomized && (
                              <div className="absolute top-1 right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                <Sparkles className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <p className="font-medium line-clamp-2 text-sm">
                              {item.name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {item.variant?.size}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {item.variant?.color}
                              </Badge>
                              {item.isCustomized && (
                                <Badge className="text-xs gap-1">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  Custom
                                </Badge>
                              )}
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-xs text-muted-foreground">
                                Quantity: {item.quantity}
                              </span>
                              <span className="font-semibold text-sm">
                                {currencySymbol}
                                {(
                                  (item.unitPrice +
                                    (item.customizationFee || 0)) *
                                  item.quantity
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {order.shippingAddress && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                          <p className="font-semibold">
                            {order.shippingAddress.house}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.street}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} -{" "}
                            {order.shippingAddress.postalCode}
                          </p>
                          <p className="text-sm font-medium">
                            {order.shippingAddress.country}
                          </p>
                        </div>
                        {order.shippingAddress.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span>Phone: {order.shippingAddress.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Price Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">
                        {currencySymbol}
                        {order.subtotal?.toFixed(2)}
                      </span>
                    </div>
                    {order.shipping > 0 ? (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="font-medium">
                          {currencySymbol}
                          {order.shipping?.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <Badge variant="secondary" className="text-xs">
                          FREE
                        </Badge>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600 font-medium">
                          Discount {order.promoCode && `(${order.promoCode})`}
                        </span>
                        <span className="text-green-600 font-semibold">
                          -{currencySymbol}
                          {order.discount?.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-semibold text-lg">
                        Total Amount
                      </span>
                      <span className="font-bold text-2xl text-primary">
                        {currencySymbol}
                        {order.total?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href={`/api/user/orders/${orderId}/invoice`} target="_blank">
              <Button variant="outline" className="w-full gap-2 h-12" size="lg">
                <Download className="h-5 w-5" />
                Download Invoice
              </Button>
            </Link>
            <Link href="/profile/orders">
              <Button className="w-full gap-2 h-12" size="lg">
                <Package className="h-5 w-5" />
                Track Order
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full gap-2 h-12" size="lg">
                <ArrowRight className="h-5 w-5" />
                Continue Shopping
              </Button>
            </Link>
          </div>

          {/* Help Section */}
          <Card className="border-2 border-dashed">
            <CardContent className="p-6 text-center space-y-2">
              <p className="text-sm font-medium">Need Help with Your Order?</p>
              <p className="text-sm text-muted-foreground">
                Our support team is here to help! Contact us at{" "}
                <a
                  href="mailto:contact@printwibe.com"
                  className="text-primary hover:underline font-semibold"
                >
                  contact@printwibe.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderSuccessContent />
    </Suspense>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading order details...</p>
      </div>
    </div>
  );
}
