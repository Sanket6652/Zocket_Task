package websocket

import (
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/Sanket6652/zocket_task/server/controllers"

	socketutils "github.com/Sanket6652/zocket_task/server/socketUtils"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleWebSocket(c *gin.Context) {
	tokenString := socketutils.ExtractToken(c)
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
		return
	}

	userID, err := socketutils.ValidateJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("WebSocket upgrade failed:", err)
		return
	}

	socketutils.Manager.Lock()
	socketutils.Manager.Clients[conn] = userID
	socketutils.Manager.Unlock()

	fmt.Printf("User %d connected via WebSocket\n", userID)

	go handleClientMessages(conn, userID)
}

func handleClientMessages(conn *websocket.Conn, userID uint) {
	defer func() {
		socketutils.Manager.Mutex.Lock()
		delete(socketutils.Manager.Clients, conn)
		socketutils.Manager.Mutex.Unlock()
		conn.Close()
	}()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("WebSocket read error:", err)
			break
		}

		var request map[string]interface{}
		if err := json.Unmarshal(message, &request); err != nil {
			socketutils.SendError(conn, "Invalid request format")
			continue
		}

		switch request["action"] {
		case "create_task":
			controllers.CreateTask(conn, request)
		case "get_tasks":
			controllers.GetAllTasks(conn)
		case "update_task":
			controllers.UpdateTask(conn, request)
		case "delete_task":
			controllers.DeleteTask(conn, request)
		default:
			socketutils.SendError(conn, "Invalid action type")
		}
	}
}
