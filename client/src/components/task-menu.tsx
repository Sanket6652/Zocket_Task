"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import type { Task } from "@/lib/types";
import { TaskForm } from "@/components/task-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WebSocketClient } from "@/lib/websocket";

interface TaskMenuProps {
  wsClient: WebSocketClient | null | undefined;
  task: Task;
}

export function TaskMenu({ wsClient, task }: TaskMenuProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const updateTaskStatus = async (
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  ) => {
    console.log("first");
    wsClient?.updateTask({
      id: task.id,
      title: task.title,
      description: task.description,
      assignee_id: task.assignee_id,
      priority: task.priority,
      deadline: task.dueDate,
      status: status,
    });
  };

  const deleteTask = async () => {
    wsClient?.deleteTask(task.id.toString());
    const updatedTasks = await wsClient?.getTasks();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => updateTaskStatus("COMPLETED")}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Completed
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateTaskStatus("IN_PROGRESS")}>
            <Clock className="mr-2 h-4 w-4" />
            Mark as In Progress
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
