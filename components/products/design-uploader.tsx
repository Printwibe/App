"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, Check } from "lucide-react"

interface DesignUploaderProps {
  productId: string
  productImage: string
  onDesignUploaded: (designId: string, designUrl: string) => void
  onCancel: () => void
}

export function DesignUploader({ productId, productImage, onDesignUploaded, onCancel }: DesignUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedDesign, setUploadedDesign] = useState<{ id: string; url: string } | null>(null)
  const [error, setError] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")

    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only PNG, JPG, and SVG files are allowed.")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("productId", productId)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setUploadedDesign({ id: data.design.id, url: data.design.fileUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleConfirm = () => {
    if (uploadedDesign) {
      onDesignUploaded(uploadedDesign.id, uploadedDesign.url)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setUploadedDesign(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg">Upload Your Design</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">Upload your image (PNG, JPG, or SVG). Max 5MB.</p>

          {!previewUrl ? (
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-foreground transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG up to 5MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                <Image src={previewUrl || "/placeholder.svg"} alt="Your design" fill className="object-contain p-4" />
                {isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
                {uploadedDesign && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={isUploading}
                className="w-full bg-transparent"
              >
                Remove and upload different design
              </Button>
            </div>
          )}
        </div>

        {/* Preview on Product */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">Preview on product</p>
          <div className="relative aspect-square bg-card rounded-lg overflow-hidden">
            <Image src={productImage || "/placeholder.svg"} alt="Product preview" fill className="object-cover" />
            {previewUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-1/3 h-1/3">
                  <Image src={previewUrl || "/placeholder.svg"} alt="Design preview" fill className="object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-border">
        <Button className="flex-1" onClick={handleConfirm} disabled={!uploadedDesign || isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Confirm Design"
          )}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
