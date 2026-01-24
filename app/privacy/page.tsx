import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { LegalPage } from "@/lib/types"

export const metadata: Metadata = {
  title: "Privacy Policy | PrintWibe",
  description: "Read our privacy policy to understand how we handle your data",
}

async function getPrivacyPage(): Promise<LegalPage | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/legal-pages?type=privacy`, {
      cache: "no-store",
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    return data.legalPage
  } catch (error) {
    console.error("Error fetching privacy page:", error)
    return null
  }
}

export default async function PrivacyPage() {
  const privacyPage = await getPrivacyPage()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">
                {privacyPage?.title || "Privacy Policy"}
              </CardTitle>
              {privacyPage && (
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(privacyPage.updatedAt).toLocaleDateString()} | Version: {privacyPage.version}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {privacyPage ? (
                <div
                  className="prose prose-sm md:prose-base max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: privacyPage.content }}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Privacy Policy is not available at the moment.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please check back later or contact support for more information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
