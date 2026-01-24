"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Upload, X, Loader2, Check, Link as LinkIcon, 
  Move, RotateCw, Save, ChevronLeft, ChevronRight, Image as ImageIcon,
  Plus, Trash2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import type { Product } from "@/lib/types"

interface DesignFile {
  id: string
  url: string
  preview: string
  name: string
  customPosition?: {
    x: number
    y: number
    width: number
    height: number
    rotation?: number
  }
}

interface ProductViewDesign {
  designId: string // Reference to uploaded design
  customPosition: {
    x: number
    y: number
    width: number
    height: number
    rotation: number
  }
  preview: string // Captured preview of this view
}

interface CustomizeWorkspaceProps {
  product: Product
  onSave: (designs: any) => void
}

export function CustomizeWorkspace({ product, onSave }: CustomizeWorkspaceProps) {
  const productImages = Array.isArray(product.images) ? product.images : [product.images]
  
  // Step 1: Upload designs to library
  const [designLibrary, setDesignLibrary] = useState<DesignFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  
  // Step 2: Select product view and apply design
  const [currentViewIndex, setCurrentViewIndex] = useState(0)
  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null)
  
  // Step 3: Position and save per view
  const [viewDesigns, setViewDesigns] = useState<Record<number, ProductViewDesign>>({})
  
  // Positioning states
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentPosition, setCurrentPosition] = useState({ x: 35, y: 35, width: 30, height: 30, rotation: 0 })
  
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [isCapturing, setIsCapturing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Get selected design from library
  const selectedDesign = designLibrary.find(d => d.id === selectedDesignId)
  
  // Check if current view has a saved design
  const currentViewHasDesign = !!viewDesigns[currentViewIndex]

  // Load existing customization data on mount (for editing)
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        // Check if we're editing from cart
        const isEditing = sessionStorage.getItem('editing-cart-item-index')
        
        // Load customization data from sessionStorage
        const storedData = sessionStorage.getItem(`customized-${product._id}`)
        
        if (storedData) {
          const parsed = JSON.parse(storedData)
          
          // Restore design library with full URLs
          if (parsed.designLibrary && Array.isArray(parsed.designLibrary)) {
            const restoredLibrary = parsed.designLibrary.map((design: any) => ({
              id: design.id,
              name: design.name,
              url: design.url,
              preview: design.url, // Use url as preview
            }))
            setDesignLibrary(restoredLibrary)
            
            // Generate previews for restored views after library is loaded
            if (parsed.viewDesigns) {
              const restoredViews: Record<number, ProductViewDesign> = {}
              
              // Create previews for each view
              for (const [index, viewData] of Object.entries(parsed.viewDesigns) as [string, any][]) {
                const design = restoredLibrary.find((d: any) => d.id === viewData.designId)
                
                if (design) {
                  // Generate preview for this view
                  const preview = await generatePreviewForView(
                    parseInt(index),
                    design,
                    viewData.customPosition
                  )
                  
                  restoredViews[parseInt(index)] = {
                    designId: viewData.designId,
                    customPosition: viewData.customPosition,
                    preview: preview || '', // Use generated preview or empty
                  }
                } else {
                  restoredViews[parseInt(index)] = {
                    designId: viewData.designId,
                    customPosition: viewData.customPosition,
                    preview: '',
                  }
                }
              }
              
              setViewDesigns(restoredViews)
            }
          }
          
          // Restore notes
          if (parsed.notes) {
            setNotes(parsed.notes)
          }
        }
      } catch (error) {
        console.error('Error loading existing customization data:', error)
      }
    }
    
    loadExistingData()
  }, [product._id])

  // Restore design when switching to a view that already has a saved design
  useEffect(() => {
    const currentViewDesign = viewDesigns[currentViewIndex]
    if (currentViewDesign && designLibrary.length > 0) {
      // Find the design in the library
      const design = designLibrary.find(d => d.id === currentViewDesign.designId)
      if (design) {
        setSelectedDesignId(design.id)
        setCurrentPosition(currentViewDesign.customPosition)
      }
    } else {
      // Reset if no saved design for this view
      if (!selectedDesignId || Object.keys(viewDesigns).length === 0) {
        setSelectedDesignId(null)
        setCurrentPosition({ x: 35, y: 35, width: 30, height: 30, rotation: 0 })
      }
    }
  }, [currentViewIndex, viewDesigns, designLibrary])

  // Upload design to library
  const handleFileUpload = async (file: File) => {
    setError("")
    
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"]
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only PNG, JPG, and SVG files are allowed.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size is 5MB.")
      return
    }

    setIsUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string
        
        const newDesign: DesignFile = {
          id: `design-${Date.now()}`,
          url: previewUrl,
          preview: previewUrl,
          name: file.name,
        }
        
        setDesignLibrary(prev => [...prev, newDesign])
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveDesignFromLibrary = (id: string) => {
    setDesignLibrary(prev => prev.filter(d => d.id !== id))
    if (selectedDesignId === id) {
      setSelectedDesignId(null)
    }
  }

  const handleSelectDesign = (id: string) => {
    setSelectedDesignId(id)
    // Reset position for new design
    setCurrentPosition({ x: 35, y: 35, width: 30, height: 30, rotation: 0 })
  }

  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    const rect = e.currentTarget.parentElement?.getBoundingClientRect()
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const container = e.currentTarget
    const rect = container.getBoundingClientRect()
    
    const x = ((e.clientX - rect.left - dragStart.x) / rect.width) * 100
    const y = ((e.clientY - rect.top - dragStart.y) / rect.height) * 100
    
    const constrainedX = Math.max(0, Math.min(100 - currentPosition.width, x))
    const constrainedY = Math.max(0, Math.min(100 - currentPosition.height, y))
    
    setCurrentPosition(prev => ({
      ...prev,
      x: constrainedX,
      y: constrainedY,
    }))
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleRotate = () => {
    setCurrentPosition(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360,
    }))
  }

  const handleResize = (e: React.MouseEvent, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    
    const startX = e.clientX
    const startY = e.clientY
    const startPos = { ...currentPosition }
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const container = previewRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100
      
      let newX = startPos.x
      let newY = startPos.y
      let newWidth = startPos.width
      let newHeight = startPos.height
      
      if (direction === 'se') {
        newWidth = Math.max(10, Math.min(100 - startPos.x, startPos.width + deltaX))
        newHeight = Math.max(10, Math.min(100 - startPos.y, startPos.height + deltaY))
      } else if (direction === 'sw') {
        const widthChange = -deltaX
        newWidth = Math.max(10, startPos.width + widthChange)
        newX = startPos.x + startPos.width - newWidth
        newHeight = Math.max(10, Math.min(100 - startPos.y, startPos.height + deltaY))
      } else if (direction === 'ne') {
        newWidth = Math.max(10, Math.min(100 - startPos.x, startPos.width + deltaX))
        const heightChange = -deltaY
        newHeight = Math.max(10, startPos.height + heightChange)
        newY = startPos.y + startPos.height - newHeight
      } else if (direction === 'nw') {
        const widthChange = -deltaX
        const heightChange = -deltaY
        newWidth = Math.max(10, startPos.width + widthChange)
        newHeight = Math.max(10, startPos.height + heightChange)
        newX = startPos.x + startPos.width - newWidth
        newY = startPos.y + startPos.height - newHeight
      }
      
      setCurrentPosition({
        x: Math.max(0, Math.min(100 - newWidth, newX)),
        y: Math.max(0, Math.min(100 - newHeight, newY)),
        width: newWidth,
        height: newHeight,
        rotation: startPos.rotation,
      })
    }
    
    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Helper function to generate preview for a specific view (used when loading existing data)
  const generatePreviewForView = async (
    viewIndex: number,
    design: DesignFile,
    position: { x: number; y: number; width: number; height: number; rotation: number }
  ): Promise<string | null> => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      
      const scale = 2
      const canvasSize = 400
      canvas.width = canvasSize * scale
      canvas.height = canvasSize * scale
      ctx.scale(scale, scale)
      
      // Load product image
      const productImg = new window.Image()
      productImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        productImg.onload = resolve
        productImg.onerror = reject
        productImg.src = productImages[viewIndex]
      })
      
      ctx.drawImage(productImg, 0, 0, canvasSize, canvasSize)
      
      // Load and draw design
      const designImg = new window.Image()
      designImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        designImg.onload = resolve
        designImg.onerror = reject
        designImg.src = design.preview
      })
      
      const x = (position.x / 100) * canvasSize
      const y = (position.y / 100) * canvasSize
      const width = (position.width / 100) * canvasSize
      const height = (position.height / 100) * canvasSize
      
      ctx.save()
      
      if (position.rotation) {
        ctx.translate(x + width / 2, y + height / 2)
        ctx.rotate((position.rotation * Math.PI) / 180)
        ctx.translate(-(x + width / 2), -(y + height / 2))
      }
      
      ctx.drawImage(designImg, x, y, width, height)
      ctx.restore()
      
      return canvas.toDataURL('image/png', 0.95)
    } catch (err) {
      console.error('Failed to generate preview for view:', err)
      return null
    }
  }

  const captureCurrentView = async (): Promise<string | null> => {
    if (!previewRef.current || !selectedDesign) return null
    
    try {
      const previewElement = previewRef.current
      const rect = previewElement.getBoundingClientRect()
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return null
      
      const scale = 2
      canvas.width = rect.width * scale
      canvas.height = rect.height * scale
      ctx.scale(scale, scale)
      
      // Load product image
      const productImg = new window.Image()
      productImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        productImg.onload = resolve
        productImg.onerror = reject
        productImg.src = productImages[currentViewIndex]
      })
      
      ctx.drawImage(productImg, 0, 0, rect.width, rect.height)
      
      // Load and draw design
      const designImg = new window.Image()
      designImg.crossOrigin = 'anonymous'
      
      await new Promise((resolve, reject) => {
        designImg.onload = resolve
        designImg.onerror = reject
        designImg.src = selectedDesign.preview
      })
      
      const x = (currentPosition.x / 100) * rect.width
      const y = (currentPosition.y / 100) * rect.height
      const width = (currentPosition.width / 100) * rect.width
      const height = (currentPosition.height / 100) * rect.height
      
      ctx.save()
      
      if (currentPosition.rotation) {
        ctx.translate(x + width / 2, y + height / 2)
        ctx.rotate((currentPosition.rotation * Math.PI) / 180)
        ctx.translate(-(x + width / 2), -(y + height / 2))
      }
      
      ctx.drawImage(designImg, x, y, width, height)
      ctx.restore()
      
      return canvas.toDataURL('image/png', 0.95)
    } catch (err) {
      console.error('Failed to capture preview:', err)
      return null
    }
  }

  const handleSaveCurrentView = async () => {
    if (!selectedDesignId) {
      setError("Please select a design first")
      return
    }

    setIsCapturing(true)
    setError("")

    try {
      const capturedPreview = await captureCurrentView()
      
      if (!capturedPreview) {
        throw new Error('Failed to capture preview')
      }
      
      setViewDesigns(prev => ({
        ...prev,
        [currentViewIndex]: {
          designId: selectedDesignId,
          customPosition: { ...currentPosition },
          preview: capturedPreview,
        }
      }))
      
      setError("")
      // Auto-advance to next view if available
      if (currentViewIndex < productImages.length - 1) {
        setCurrentViewIndex(currentViewIndex + 1)
        setSelectedDesignId(null)
        setCurrentPosition({ x: 35, y: 35, width: 30, height: 30, rotation: 0 })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save view')
    } finally {
      setIsCapturing(false)
    }
  }

  const handleFinalSave = () => {
    const savedViewsCount = Object.keys(viewDesigns).length
    if (savedViewsCount === 0) {
      setError("Please save at least one product view")
      return
    }

    onSave({
      viewDesigns,
      designLibrary,
      notes,
    })
  }

  const handleEditView = (viewIndex: number) => {
    const viewData = viewDesigns[viewIndex]
    if (!viewData) return

    // Switch to that view
    setCurrentViewIndex(viewIndex)
    
    // Load the design and position
    setSelectedDesignId(viewData.designId)
    setCurrentPosition(viewData.customPosition)
  }

  const handleDeleteView = (viewIndex: number) => {
    setViewDesigns(prev => {
      const updated = { ...prev }
      delete updated[viewIndex]
      return updated
    })
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Left Sidebar - Design Library */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-muted/30 p-4 sm:p-6 overflow-y-auto max-h-[40vh] lg:max-h-none">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Design Library</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your designs here first
            </p>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full"
              variant="outline"
            >
              {isUploading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" /> Upload Design</>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/svg+xml"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <Separator />

          {/* Design Library Grid */}
          <div>
            <Label className="mb-3 block">Your Designs ({designLibrary.length})</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
              {designLibrary.map(design => (
                <Card 
                  key={design.id}
                  className={`cursor-pointer transition-all ${
                    selectedDesignId === design.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleSelectDesign(design.id)}
                >
                  <CardContent className="p-2">
                    <div className="relative aspect-square bg-muted rounded overflow-hidden mb-2">
                      <Image
                        src={design.preview}
                        alt={design.name}
                        fill
                        className="object-contain p-1"
                      />
                      {selectedDesignId === design.id && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs truncate flex-1">{design.name}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveDesignFromLibrary(design.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {designLibrary.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-sm text-muted-foreground">
                <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">No designs yet</p>
                <p className="text-xs mt-1">Upload designs to get started</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <Label className="mb-2 block">Special Instructions</Label>
            <Textarea
              placeholder="Add any special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>
      </div>

      {/* Main Area - Product Views & Positioning */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - View Selector */}
        <div className="border-b p-3 sm:p-4 bg-background">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-sm sm:text-base">Product Views</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Select view, choose design, position it, then save
              </p>
            </div>
            <Badge variant="secondary" className="self-start sm:self-auto">
              {Object.keys(viewDesigns).length}/{productImages.length} views saved
            </Badge>
          </div>
          
          {/* View thumbnails */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
            {productImages.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentViewIndex(index)
                  setSelectedDesignId(null)
                  setCurrentPosition({ x: 35, y: 35, width: 30, height: 30, rotation: 0 })
                }}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  currentViewIndex === index ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-border'
                }`}
              >
                <Image src={img} alt={`View ${index + 1}`} fill className="object-cover" />
                {viewDesigns[index] && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-0.5 text-center">
                  View {index + 1}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <Label className="text-sm sm:text-base">
                View {currentViewIndex + 1} - {selectedDesign ? 'Position Your Design' : 'Select a design from library'}
              </Label>
              <div className="flex gap-2">
                {selectedDesign && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRotate}
                    className="text-xs sm:text-sm"
                  >
                    <RotateCw className="h-4 w-4 mr-1" />
                    Rotate
                  </Button>
                )}
              </div>
            </div>

            <div 
              ref={previewRef}
              className="relative aspect-square bg-background rounded-lg overflow-hidden border-2 shadow-lg"
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
            >
              {/* Product Image */}
              <Image 
                src={productImages[currentViewIndex]} 
                alt={`View ${currentViewIndex + 1}`} 
                fill 
                className="object-cover pointer-events-none" 
              />

              {/* Design Overlay */}
              {selectedDesign && (
                <div 
                  style={{
                    position: 'absolute',
                    left: `${currentPosition.x}%`,
                    top: `${currentPosition.y}%`,
                    width: `${currentPosition.width}%`,
                    height: `${currentPosition.height}%`,
                    transform: currentPosition.rotation ? `rotate(${currentPosition.rotation}deg)` : undefined,
                  }}
                  className="group cursor-move"
                  onMouseDown={handleDragStart}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedDesign.preview}
                      alt="Design"
                      fill
                      className="object-contain pointer-events-none"
                      style={{
                        transform: currentPosition.rotation ? `rotate(${currentPosition.rotation}deg)` : undefined
                      }}
                    />
                    
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border-2 border-primary border-dashed">
                      <Move className="h-6 w-6 text-primary" />
                    </div>
                    
                    {/* Resize Handles */}
                    <div 
                      className="absolute -top-1 -left-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 cursor-nw-resize"
                      onMouseDown={(e) => handleResize(e, 'nw')}
                    />
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 cursor-ne-resize"
                      onMouseDown={(e) => handleResize(e, 'ne')}
                    />
                    <div 
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 cursor-sw-resize"
                      onMouseDown={(e) => handleResize(e, 'sw')}
                    />
                    <div 
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 cursor-se-resize"
                      onMouseDown={(e) => handleResize(e, 'se')}
                    />
                  </div>
                </div>
              )}

              {!selectedDesign && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground px-4">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 sm:mb-3 opacity-50" />
                    <p className="text-base sm:text-lg font-medium">Select a design from the library</p>
                    <p className="text-xs sm:text-sm mt-1">Choose a design to position on this view</p>
                  </div>
                </div>
              )}
            </div>

            {/* Save View Button */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={handleSaveCurrentView}
                disabled={!selectedDesign || isCapturing}
                className="flex-1 text-sm sm:text-base"
                size="lg"
              >
                {isCapturing ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Capturing...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save View {currentViewIndex + 1}</>
                )}
              </Button>
              
              {Object.keys(viewDesigns).length > 0 && (
                <Button
                  onClick={handleFinalSave}
                  variant="default"
                  size="lg"
                  className="px-6 sm:px-8 text-sm sm:text-base"
                >
                  Complete
                </Button>
              )}
            </div>

            {/* Saved Views Preview */}
            {Object.keys(viewDesigns).length > 0 && (
              <div className="mt-6 sm:mt-8">
                <Label className="mb-3 block text-sm sm:text-base">Saved Views</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(viewDesigns).map(([index, viewDesign]) => {
                    const hasPreview = viewDesign.preview && viewDesign.preview !== ''
                    
                    return (
                      <Card key={index} className="group relative">
                        <CardContent className="p-3">
                          <div className="relative aspect-square bg-muted rounded overflow-hidden mb-2">
                            {hasPreview ? (
                              <Image
                                src={viewDesign.preview}
                                alt={`Saved view ${parseInt(index) + 1}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              // Loading placeholder while preview is being generated
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">Generating preview...</p>
                                </div>
                              </div>
                            )}
                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEditView(parseInt(index))}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteView(parseInt(index))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">View {parseInt(index) + 1}</span>
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Saved
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
