package controllers

import (
	"context"
	
	"net/http"
	"time"
	"fmt"
	"github.com/Sanket6652/zocket_task/server/config"
	"github.com/Sanket6652/zocket_task/server/model"
	"github.com/Sanket6652/zocket_task/server/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Register(c *gin.Context) {
	var user model.User
	if err := c.ShouldBindJSON(&user); err != nil {
		fmt.Println("Bind error:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	if user.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password cannot be empty"})
		return
	}
	// Check if email already exists
	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existing model.User

	err := collection.FindOne(ctx, bson.M{"email": user.Email}).Decode(&existing)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}
		
	// Hash the password
	hashedPassword, err := services.HashPassword(user.Password)
	if err != nil {
		fmt.Println("Hash error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	
	user.Password = hashedPassword
	user.CreatedAt = time.Now().Unix()
	user.ID = primitive.NewObjectID()

	_, err = collection.InsertOne(ctx, user)
	if err != nil {
		fmt.Println("Insert error:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	collection := config.DB.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var user model.User
	err := collection.FindOne(ctx, bson.M{"email": input.Email}).Decode(&user)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials email"})
		return
	}
	
	if !services.CheckPassword(input.Password, user.Password){
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials password"})
		return
	}
   
	token, err := services.GenerateJWT(user.ID.Hex())

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}



// func GetAllUsers(c *gin.Context) {
// 	var users []model.User
// 	collection := config.DB.Collection("users")
	
// 	if err := collection.Find(&users).Error; err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
// 		return
// 	}

// 	userResponses := make([]gin.H, 0, len(users))
// 	for _, user := range users {
// 		userResponses = append(userResponses, gin.H{
// 			"id":   user.ID,
// 			"name": user.Username,
// 		})
// 	}

// 	c.JSON(http.StatusOK, gin.H{"users": userResponses})
// }