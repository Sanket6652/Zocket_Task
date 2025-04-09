package socketutils

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt"
	"github.com/gorilla/websocket"
)


type ClientManager struct {
	Clients map[*websocket.Conn]uint 
	Mutex   sync.Mutex               
}

var Manager = ClientManager{
	Clients: make(map[*websocket.Conn]uint),
}

func (m *ClientManager) Lock() {
	m.Mutex.Lock()
}

func (m *ClientManager) Unlock() {
	m.Mutex.Unlock()
}


func SendError(conn *websocket.Conn, errorMsg string) {
	response := map[string]interface{}{
		"event": "error",
		"error": errorMsg,
	}
	message, _ := json.Marshal(response)
	conn.WriteMessage(websocket.TextMessage, message)
}


func BroadcastMessage(message []byte) {
	Manager.Mutex.Lock()
	defer Manager.Mutex.Unlock()

	for conn := range Manager.Clients {
		conn.WriteMessage(websocket.TextMessage, message)
	}
}

func ExtractToken(c *gin.Context) string {
	token := c.Query("token")
	if token == "" {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			return ""
		}
		parts := strings.Split(authHeader, "Bearer ")
		if len(parts) != 2 {
			return ""
		}
		token = parts[1]
	}
	return token
}

func ValidateJWT(tokenString string) (uint, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil || !token.Valid {
		return 0, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if userIDStr, ok := claims["user_id"].(string); ok {
		
			fmt.Println("Validated user ID:", userIDStr)
			return 0, nil 
		}
	}

	return 0, fmt.Errorf("invalid token claims")
}

