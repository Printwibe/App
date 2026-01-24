"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, Save, Loader2, CheckCircle, ScrollText, Shield } from "lucide-react"
import type { LegalPage } from "@/lib/types"

export default function AdminLegalPagesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [legalPages, setLegalPages] = useState<Record<string, LegalPage>>({})
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms")

  // Form states
  const [termsTitle, setTermsTitle] = useState("")
  const [termsContent, setTermsContent] = useState("")
  const [privacyTitle, setPrivacyTitle] = useState("")
  const [privacyContent, setPrivacyContent] = useState("")

  useEffect(() => {
    fetchLegalPages()
  }, [])

  const fetchLegalPages = async () => {
    try {
      const response = await fetch("/api/v1/admin/legal-pages")
      if (!response.ok) throw new Error("Failed to fetch legal pages")
      const data = await response.json()
      
      const pagesMap: Record<string, LegalPage> = {}
      data.legalPages?.forEach((page: LegalPage) => {
        pagesMap[page.type] = page
      })
      
      setLegalPages(pagesMap)

      // Set form values
      if (pagesMap.terms) {
        setTermsTitle(pagesMap.terms.title)
        setTermsContent(pagesMap.terms.content)
      }
      if (pagesMap.privacy) {
        setPrivacyTitle(pagesMap.privacy.title)
        setPrivacyContent(pagesMap.privacy.content)
      }
    } catch (error) {
      console.error("Error fetching legal pages:", error)
      alert("Failed to load legal pages")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (type: "terms" | "privacy") => {
    setSaving(type)
    setSuccess(null)

    try {
      const title = type === "terms" ? termsTitle : privacyTitle
      const content = type === "terms" ? termsContent : privacyContent

      if (!title.trim() || !content.trim()) {
        alert("Title and content are required")
        return
      }

      const response = await fetch("/api/v1/admin/legal-pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save legal page")
      }

      const data = await response.json()
      
      // Update local state
      setLegalPages((prev) => ({
        ...prev,
        [type]: data.legalPage,
      }))

      setSuccess(type)
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error("Error saving legal page:", error)
      alert(error instanceof Error ? error.message : "Failed to save legal page")
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Legal Pages</h1>
          <p className="text-muted-foreground mt-1">
            Manage Terms & Conditions and Privacy Policy
          </p>
        </div>
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Compact Toggle Buttons */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === "terms" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("terms")}
        >
          <ScrollText className="mr-2 h-4 w-4" />
          Terms
        </Button>
        <Button
          variant={activeTab === "privacy" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("privacy")}
        >
          <Shield className="mr-2 h-4 w-4" />
          Privacy
        </Button>
      </div>

      {/* Terms & Conditions Content */}
      {activeTab === "terms" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
              {legalPages.terms && (
                <p className="text-sm text-muted-foreground">
                  Version: {legalPages.terms.version || 1} | Last updated:{" "}
                  {new Date(legalPages.terms.updatedAt).toLocaleDateString()}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="terms-title">Title</Label>
                <Input
                  id="terms-title"
                  placeholder="Enter title"
                  value={termsTitle}
                  onChange={(e) => setTermsTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms-content">Content</Label>
                <Textarea
                  id="terms-content"
                  placeholder="Enter terms and conditions content..."
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  You can use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSave("terms")}
                  disabled={saving === "terms"}
                  className="w-full sm:w-auto"
                >
                  {saving === "terms" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Terms & Conditions
                    </>
                  )}
                </Button>
                {success === "terms" && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="text-sm">Saved successfully!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Privacy Policy Content */}
      {activeTab === "privacy" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              {legalPages.privacy && (
                <p className="text-sm text-muted-foreground">
                  Version: {legalPages.privacy.version || 1} | Last updated:{" "}
                  {new Date(legalPages.privacy.updatedAt).toLocaleDateString()}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="privacy-title">Title</Label>
                <Input
                  id="privacy-title"
                  placeholder="Enter title"
                  value={privacyTitle}
                  onChange={(e) => setPrivacyTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="privacy-content">Content</Label>
                <Textarea
                  id="privacy-content"
                  placeholder="Enter privacy policy content..."
                  value={privacyContent}
                  onChange={(e) => setPrivacyContent(e.target.value)}
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  You can use HTML tags for formatting (e.g., &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleSave("privacy")}
                  disabled={saving === "privacy"}
                  className="w-full sm:w-auto"
                >
                  {saving === "privacy" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Privacy Policy
                    </>
                  )}
                </Button>
                {success === "privacy" && (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span className="text-sm">Saved successfully!</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
