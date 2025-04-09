"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AiSuggestionButton } from "@/components/ai-suggestion-button";
import type { Task, User } from "@/lib/types";
import { WebSocketClient } from "@/lib/websocket";

interface TaskFormProps {
  wsClient: WebSocketClient | null | undefined;
  task?: Task;
  onSuccess: () => void;
  assignees: User[];
}

export function TaskForm({assignees, wsClient, task, onSuccess }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<
    "PENDING" | "IN_PROGRESS" | "COMPLETED" | undefined
  >(task?.status || "PENDING");
  const [priority, setPriority] = useState<
    "LOW" | "MEDIUM" | "HIGH" | undefined
  >(task?.priority || "MEDIUM");
  const [dueDate, setDueDate] = useState(task?.dueDate || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [assigneeId, setAssigneeId] = useState<string | undefined>(
    task?.assignee_id.toString
  );


  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    wsClient?.createTask({
      title: title,
      description: description,
      assignee_id: assigneeId,
      priority: priority,
      deadline: dueDate,
      status: status,
      
    });
    toast({
      message: task ? "Task updated" : "Task created",
      description: task
        ? "Your task has been updated"
        : "Your new task has been created",
    });

    onSuccess();
    form.reset();
  };
  const handleAiSuggestion = (suggestion: {
    title: string;
    description: string;
  }) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
  };

  return (
    <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <div className="flex gap-2">
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
          />
          <AiSuggestionButton onSuggestion={handleAiSuggestion} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the task..."
          rows={4}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={status}
            onValueChange={(value) =>
              setStatus(value.toUpperCase() as typeof status)
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={priority}
            onValueChange={(value) =>
              setPriority(value.toUpperCase() as typeof priority)
            }
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assignee_id">Assignee</Label>
          <Select
            value={assigneeId?.toString()}
            onValueChange={(value) => setAssigneeId(value)}
          >
            <SelectTrigger id="assignee_id">
              <SelectValue placeholder="Select assignee"  />
            </SelectTrigger>
            <SelectContent>
              {assignees.map((assignee) => (
                <SelectItem key={assignee.id} value={assignee.id.toString()}>
                  {assignee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date (Optional)</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="outline" type="button" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
