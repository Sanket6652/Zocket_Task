"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskList } from "@/components/task-list";
import { TaskCreateButton } from "@/components/task-create-button";
import { TaskFilter } from "@/components/task-filter";
import { useToast } from "@/components/ui/use-toast";
import type { Task } from "@/lib/types";
import { MainNav } from "@/components/main-nav";
import { UserNav } from "@/components/user-nav";
import { Plus, X } from "lucide-react";
import { getCurrentUser, getUsers } from "@/lib/api";
import { User } from "@/lib/types";
import { WebSocketClient } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "@/components/task-form";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wsClient, setWsClient] = useState<WebSocketClient | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth");
      return;
    }
    // Fetch tasks from API
    const initializeData = async () => {
      try {
        const userResponse = await getCurrentUser(token);
        setCurrentUser(userResponse.user);

        const usersResponse = await getUsers(token);
        setUsers(usersResponse.users);

        const ws = new WebSocketClient(token);
        setWsClient(ws);

        ws.onMessage((event) => {
          if (event.event === "task_list") {
            setTasks(event.tasks || []);
          } else if (
            event.event === "task_created" ||
            event.event === "task_updated"
          ) {
            ws.getTasks();
          }
        });

        ws.getTasks();
      } catch (error) {
        toast({
          type: "error",
          message: "Error",
          description: "Failed to load tasks. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    return () => {
      if (wsClient) {
        wsClient.close();
      }
    };
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    if (filter === "completed") return task.status === "COMPLETED";
    if (filter === "in-progress") return task.status === "IN_PROGRESS";
    if (filter === "pending") return task.status === "PENDING";
    return true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav />
          <UserNav />
        </div>
      </header>
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="container">
          <div className="flex items-center justify-between px-2">
            <div className="grid gap-1">
              <h1 className="text-2xl font-bold tracking-wide">Tasks</h1>
              <p className="text-muted-foreground">
                Create and manage your tasks
              </p>
            </div>
            <div>
              <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription>
                      Add a new task to your workflow
                    </DialogDescription>
                  </DialogHeader>
                  <TaskForm
                    onSuccess={() => setIsOpen(false)}
                    wsClient={wsClient}
                    assignees={users}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="grid gap-4 ">
            <TaskFilter currentFilter={filter} onFilterChange={setFilter} />
            <TaskList
              tasks={filteredTasks}
              isLoading={isLoading}
              wsClient={wsClient}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
