package routes

import (
	"net/http"
	"github.com/Sanket6652/zocket_task/server/controllers"
	"github.com/Sanket6652/zocket_task/server/middlewares"
	websocket "github.com/Sanket6652/zocket_task/server/socket"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	authRoutes := r.Group("/auth")
	authRoutes.POST("/register", controllers.Register)
	authRoutes.POST("/login", controllers.Login)

	r.GET("/ws", websocket.HandleWebSocket)
	r.OPTIONS("/*path", func(c *gin.Context) {
		c.AbortWithStatus(204)
	})
	protectedRoutes := r.Group("/api")
	protectedRoutes.Use(middlewares.JWTAuthMiddleware())

	protectedRoutes.GET("/protected", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "You are authorized!"})
	})
	
	userRoutes := protectedRoutes.Group("/users")
	{
		userRoutes.GET("/all", controllers.GetAllUsers)
		userRoutes.POST("/user", controllers.GetUser)
	}

}
