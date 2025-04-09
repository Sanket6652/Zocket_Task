import { Task, TaskEvent } from "./types";

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private token: string;
  private messageHandlers: ((event: TaskEvent) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private initialLoadDone = false; // 👈 Added to avoid multiple getTasks() calls

  constructor(token: string) {
    this.token = token;
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket(`ws://localhost:5000/ws?token=${this.token}`);

      this.ws.onopen = () => {
        console.log("✅ WebSocket connected");
        this.reconnectAttempts = 0;

        // ✅ Call getTasks only after connection opens
        if (!this.initialLoadDone) {
          this.getTasks();
          this.initialLoadDone = true;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as TaskEvent;
          this.messageHandlers.forEach((handler) => handler(data));
        } catch (error) {
          console.error("❌ Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = () => {
        console.log("❌ WebSocket disconnected");
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error("⚠️ WebSocket error:", error);
      };
    } catch (error) {
      console.error("❌ Failed to create WebSocket connection:", error);
      this.handleReconnect();
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔁 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
      setTimeout(
        () => this.connect(),
        this.reconnectDelay * this.reconnectAttempts
      );
    } else {
      console.error("🚫 Max reconnection attempts reached");
    }
  }

  public onMessage(handler: (event: TaskEvent) => void) {
    this.messageHandlers.push(handler);
  }

  public createTask(task: Partial<Task>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "create_task",
          ...task,
        })
      );
    } else {
      console.error("🚫 WebSocket is not connected (createTask)");
    }
  }

  public updateTask(task: Partial<Task>) {
    console.log("📤 Calling updateTask()");
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          action: "update_task",
          task: task,
        })
      );
    } else {
      console.error("🚫 WebSocket is not connected (updateTask)");
    }
  }

  public getTasks() {
    console.log("📤 Calling getTasks()");
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            action: "get_tasks",
          })
        );
        console.log("✅ getTasks message sent");
      } catch (error) {
        console.error("❌ Error sending getTasks request:", error);
      }
    } else {
      console.error("🚫 WebSocket is not connected (getTasks)");
    }
  }

  public deleteTask(taskId: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            action: "delete_task",
            task: {
              id: taskId,
            },
          })
        );
      } catch (error) {
        console.error("❌ Error deleting task:", error);
      }
    } else {
      console.error("🚫 WebSocket is not connected (deleteTask)");
    }
  }

  public close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
