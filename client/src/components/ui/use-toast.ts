"use client"

import { toast } from "sonner"

interface ToastProps {
  message: string
  title?: string
  type?: "success" | "error" | "info" | "warning"
  description?: string
}

export function useToast() {
  const showToast = ({
    message,
    title,
    type = "success",
    description,
  }: ToastProps) => {
    switch (type) {
      case "success":
        toast.success(message, {
          description,
        })
        break
      case "error":
        toast.error(message, {
          description,
        })
        break
      case "warning":
        toast.warning(message, {
          description,
        })
        break
      default:
        toast(message, {
          description,
        })
    }
  }

  return {
    toast: showToast,
  }
}