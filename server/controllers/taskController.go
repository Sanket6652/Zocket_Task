package controllers

import (
	"context"
	"encoding/json"
	"strings"
	model "github.com/Sanket6652/zocket_task/server/model"
	socketUtils "github.com/Sanket6652/zocket_task/server/socketUtils"
	"time"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
		"go.mongodb.org/mongo-driver/mongo"
)

var (
	taskCollection *mongo.Collection
	userCollection *mongo.Collection
)

func InitController(db *mongo.Database) {
	taskCollection = db.Collection("tasks")
	userCollection = db.Collection("users")
}
func GetAllTasks(conn *websocket.Conn) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := taskCollection.Find(ctx, bson.M{})
	if err != nil {
		socketUtils.SendError(conn, "Failed to fetch tasks")
		return
	}
	defer cursor.Close(ctx)

	var tasks []model.Task
	if err = cursor.All(ctx, &tasks); err != nil {
		socketUtils.SendError(conn, "Error decoding tasks")
		return
	}

	response := map[string]interface{}{
		"event": "task_list",
		"tasks": tasks,
	}
	message, _ := json.Marshal(response)
	conn.WriteMessage(websocket.TextMessage, message)
}

func DeleteTask(conn *websocket.Conn, request map[string]interface{}) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	taskData, ok := request["task"].(map[string]interface{})
	if !ok {
		socketUtils.SendError(conn, "Invalid task payload")
		return
	}

	idStr, ok := taskData["id"].(string)
	if !ok || idStr == "" {
		socketUtils.SendError(conn, "Missing or invalid task ID")
		return
	}

	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		socketUtils.SendError(conn, "Invalid task ID format")
		return
	}

	res, err := taskCollection.DeleteOne(ctx, bson.M{"_id": objectID})
	if err != nil || res.DeletedCount == 0 {
		socketUtils.SendError(conn, "Failed to delete task")
		return
	}

	response := map[string]interface{}{
		"event":   "task_deleted",
		"task_id": idStr,
	}
	message, _ := json.Marshal(response)
	socketUtils.BroadcastMessage(message)
}

func CreateTask(conn *websocket.Conn, request map[string]interface{}) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	title, _ := request["title"].(string)
	desc, _ := request["desc"].(string)

	var assigneeID primitive.ObjectID
	if val, ok := request["assignee_id"].(string); ok {
		id, err := primitive.ObjectIDFromHex(val)
		if err != nil {
			socketUtils.SendError(conn, "Invalid assignee ID")
			return
		}
		assigneeID = id
	} else {
		socketUtils.SendError(conn, "Assignee ID must be a string")
		return
	}

	

	statusStr, _ := request["status"].(string)
	statusStr = strings.TrimSpace(strings.ToLower(statusStr))
	var status model.TaskStatus
	if err := status.FromString(statusStr); err != nil {
		socketUtils.SendError(conn, "Invalid task status")
		return
	}

	var deadline time.Time
	if deadlineStr, ok := request["deadline"].(string); ok && deadlineStr != "" {
		dt, err := time.Parse("2006-01-02", deadlineStr)
		if err != nil {
			socketUtils.SendError(conn, "Invalid deadline format. Use YYYY-MM-DD")
			return
		}
		deadline = dt
	}

	var user model.User
	if err := userCollection.FindOne(ctx, bson.M{"_id": assigneeID}).Decode(&user); err != nil {
		socketUtils.SendError(conn, "Assignee not found")
		return
	}
	priority, _ := request["priority"].(string)
	priority = strings.ToUpper(strings.TrimSpace(priority))
	if priority != "LOW" && priority != "MEDIUM" && priority != "HIGH" {
		socketUtils.SendError(conn, "Invalid priority value")
		return
	}

	dueDate, _ := request["dueDate"].(string)

	task := model.Task{
		ID:          primitive.NewObjectID(),
		Title:       title,
		Description: desc,
		AssigneeID:  assigneeID,
		Status:      status,
		Deadline:    deadline,
		Priority:  priority,
		DueDate:     dueDate,
		CreatedAt:   time.Now(),
	}

	_, err := taskCollection.InsertOne(ctx, task)
	if err != nil {
		socketUtils.SendError(conn, "Failed to create task")
		return
	}

	response := map[string]interface{}{
		"event": "task_created",
		"task":  task,
	}
	message, _ := json.Marshal(response)
	socketUtils.BroadcastMessage(message)
	
}

func UpdateTask(conn *websocket.Conn, request map[string]interface{}) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	// Get the task payload
	taskData, ok := request["task"].(map[string]interface{})
	if !ok {
		socketUtils.SendError(conn, "Invalid task payload")
		return
	}	
	// Extract and validate ID
	idStr, ok := taskData["id"].(string)
	if !ok || idStr == "" {
		socketUtils.SendError(conn, "Missing or invalid task ID")
		return
	}

	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		socketUtils.SendError(conn, "Invalid task ID format")
		return
	}

	// Prepare update fields
	updates := bson.M{}

	if title, ok := taskData["title"].(string); ok {
		updates["title"] = title
	}
	if desc, ok := taskData["description"].(string); ok {
		updates["description"] = desc
	}
	if deadlineStr, ok := taskData["deadline"].(string); ok && deadlineStr != "" {
		dt, err := time.Parse(time.RFC3339, deadlineStr) // <-- ISO format preferred
		if err != nil {
			socketUtils.SendError(conn, "Invalid deadline format (use ISO8601)")
			return
		}
		updates["deadline"] = dt
	}
	if statusStr, ok := taskData["status"].(string); ok {
		var status model.TaskStatus
		if err := status.FromString(statusStr); err != nil {
			socketUtils.SendError(conn, "Invalid status value")
			return
		}
		updates["status"] = status
	}
	if priority, ok := taskData["priority"].(string); ok {
		updates["priority"] = priority
	}
	if dueDate, ok := taskData["dueDate"].(string); ok {
		updates["dueDate"] = dueDate
	}

	if len(updates) == 0 {
		socketUtils.SendError(conn, "No fields to update")
		return
	}

	_, err = taskCollection.UpdateOne(ctx, bson.M{"_id": objectID}, bson.M{"$set": updates})
	if err != nil {
		socketUtils.SendError(conn, "Failed to update task")
		return
	}

	var updatedTask model.Task
	err = taskCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&updatedTask)
	if err != nil {
		socketUtils.SendError(conn, "Updated task fetch failed")
		return
	}

	response := map[string]interface{}{
		"event": "task_updated",
		"task":  updatedTask,
	}
	message, _ := json.Marshal(response)
	socketUtils.BroadcastMessage(message)

	
}
