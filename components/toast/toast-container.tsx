"use client"
import { AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react"
import type { Toast } from "@/lib/use-toast-hook"

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getBgColor = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      case "info":
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTextColor = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "text-green-800"
      case "error":
        return "text-red-800"
      case "warning":
        return "text-yellow-800"
      case "info":
        return "text-blue-800"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg border ${getBgColor(toast.type)} animate-in slide-in-from-top fade-in`}
          onClick={() => removeToast(toast.id)}
        >
          {getIcon(toast.type)}
          <span className={`flex-1 text-sm font-medium ${getTextColor(toast.type)}`}>{toast.message}</span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              removeToast(toast.id)
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
