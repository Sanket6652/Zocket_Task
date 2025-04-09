package main

import (
	"fmt"
	"os"
	"time"
	"github.com/Sanket6652/zocket_task/server/config"
	"github.com/Sanket6652/zocket_task/server/routes"
	"github.com/Sanket6652/zocket_task/server/controllers"
	"github.com/joho/godotenv"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	_ = godotenv.Load()
	if err := config.ConnectDB(); err != nil {
		panic(fmt.Sprintf("Could not connect to database: %v", err))
	}
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	
	controllers.InitController(config.DB)
	r := gin.Default()
	var allowedOrigins = []string{
		"http://localhost:3000",
		"https://zocket-task-kdds.onrender.com",
	}
	
	r.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	
	routes.SetupRoutes(r)
	fmt.Println("Server is running on port", port)
	r.Run(":" + port)
}
