"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TaskFilterProps {
  currentFilter: string
  onFilterChange: (filter: string) => void
}

export function TaskFilter({ currentFilter, onFilterChange }: TaskFilterProps) {
  
  return (
    <div className="flex flex-wrap gap-2 ">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange("all")}
        className={cn(currentFilter === "all" && "bg-primary  text-primary-foreground hover:bg-primary/90")}
      >
        All
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange("pending")}
        className={cn(currentFilter === "pending" && "bg-primary text-primary-foreground hover:bg-primary/90")}
      >
        Pending
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange("in-progress")}
        className={cn(currentFilter === "in-progress" && "bg-primary text-primary-foreground hover:bg-primary/90")}
      >
        In Progress
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange("completed")}
        className={cn(currentFilter === "completed" && "bg-primary text-primary-foreground hover:bg-primary/90")}
      >
        Completed
      </Button>
    </div>
  )
}

