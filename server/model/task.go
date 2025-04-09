package model

import (
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TaskStatus string

const (
	Pending    TaskStatus = "PENDING"
	InProgress TaskStatus = "IN_PROGRESS"
	Completed  TaskStatus = "COMPLETED"
)

type Task struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	AssigneeID  primitive.ObjectID `bson:"assignee_id" json:"assignee_id"`
	Status      TaskStatus         `bson:"status" json:"status"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	Deadline    time.Time          `bson:"deadline" json:"deadline"`
	Priority    string             `bson:"priority" json:"priority"` // from frontend: "LOW", "MEDIUM", "HIGH"
	DueDate     string             `bson:"dueDate" json:"dueDate"`   // from frontend as string (optional redundancy)
}

// Set default values before inserting into MongoDB
func (t *Task) SetDefaults() {
	t.Status = Pending
	t.CreatedAt = time.Now()
	// t.UpdatedAt = time.Now()
}


func (t *TaskStatus) FromString(s string) error {
	switch s {
	case "pending", "PENDING":
		*t = Pending
	case "in_progress", "IN_PROGRESS":
		*t = InProgress
	case "completed", "COMPLETED":
		*t = Completed
	default:
		return fmt.Errorf("invalid task status: %s", s)
	}
	return nil
}
