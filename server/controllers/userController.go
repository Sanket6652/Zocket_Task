package controllers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/Sanket6652/zocket_task/server/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/gin-gonic/gin"
)



// Initialize the MongoDB collection for users
func InitUserController(db *mongo.Database) {
	userCollection = db.Collection("users")
}

// GetAllUsers fetches all users from MongoDB
func GetAllUsers(c *gin.Context) {
	fmt.Println("userCollection is nil!")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if userCollection == nil {
		fmt.Println("userCollection is nil!")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User collection not initialized"})
		return
	}
	cursor, err := userCollection.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve users"})
		return
	}
	defer cursor.Close(ctx)

	var users []model.User
	if err := cursor.All(ctx, &users); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error decoding users"})
		return
	}

	userResponses := make([]gin.H, 0, len(users))
	for _, user := range users {
		userResponses = append(userResponses, gin.H{
			"id":   user.ID.Hex(),
			"name": user.Username,
		})
	}

	c.JSON(http.StatusOK, gin.H{"users": userResponses})
}


func GetUser(c *gin.Context) {
	var user model.User
	userId, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objectID, err := primitive.ObjectIDFromHex(fmt.Sprintf("%v", userId))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := userCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&user); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	userResponse := gin.H{
		"id":    user.ID.Hex(),
		"name":  user.Username,
		"email": user.Email,
	}

	c.JSON(http.StatusOK, gin.H{"user": userResponse})
}
