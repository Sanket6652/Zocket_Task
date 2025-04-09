"use client";

import { useState } from "react";
import type { Task } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "@/lib/date-utils";
import { WebSocketClient } from "@/lib/websocket";
import { TaskMenu } from "./task-menu";

interface TaskListProps {
  wsClient: WebSocketClient | null | undefined;
  tasks: Task[];
  isLoading: boolean;
}

export function TaskList({ wsClient, tasks, isLoading }: TaskListProps) {
 

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-4/5" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter className="p-4 flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-medium">No tasks found</h3>
        <p className="text-muted-foreground">
          Create a new task to get started
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-blue-500";
      case "PENDING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <Card
            key={task.id}
            className="overflow-hidden hover:shadow-md transition-shadow"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(task.created_at))}
                  </CardDescription>
                </div>
                <TaskMenu task={task} wsClient={wsClient}  />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 cursor-pointer">
              <p className="text-sm line-clamp-3">{task.description}</p>
            </CardContent>
            <CardFooter className="p-4 flex items-center justify-between">
              <Badge className={getStatusColor(task.status)}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
