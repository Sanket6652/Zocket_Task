"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AiSuggestionButtonProps {
  onSuggestion: (suggestion: { title: string; description: string }) => void
}

export function AiSuggestionButton({ onSuggestion }: AiSuggestionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{ title: string; description: string }>>([])
  const { toast } = useToast()

  const generateSuggestions = async () => {
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to generate suggestions")
      }

      const data = await response.json()
      setSuggestions(data.suggestions)
    } catch (error) {
      toast({
        
        message: "Error",
        type:"error",
        description: "Failed to generate AI suggestions",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpen = () => {
    setIsOpen(true)
    generateSuggestions()
  }

  const handleSelect = (suggestion: { title: string; description: string }) => {
    onSuggestion(suggestion)
    setIsOpen(false)
  }

  return (
    <>
      <Button type="button" variant="outline" size="icon" onClick={handleOpen} title="Get AI suggestions">
        <Sparkles className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>AI Task Suggestions</DialogTitle>
            <DialogDescription>Select a suggestion to use for your task</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="py-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto py-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => handleSelect(suggestion)}
                >
                  <h3 className="font-medium">{suggestion.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{suggestion.description}</p>
                </div>
              ))}

              {suggestions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">No suggestions available. Try again later.</div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={generateSuggestions} disabled={isLoading}>
              {isLoading ? "Generating..." : "Regenerate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

