// =============================================================================
// CloudNative University — Community Edition (CE)
// Database Layer & Data Models
//
// Author  : Victor S. Recio (@vsroot_)
// Contact : vsrecio@nixversity.com
// License : MIT
//
// AI Pair Programming: Antigravity (Google DeepMind) assisted in the design
// and development of this platform.
// =============================================================================
package api


import (
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

type User struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	Name           string `gorm:"uniqueIndex" json:"name"`
	Email          string `gorm:"uniqueIndex" json:"email"` // Academic/Enrollment Email
	Password       string `json:"-"`
	Role           string `json:"role"`
	ProfilePicture string `json:"profile_picture"`
	Headline       string `json:"headline"`
}

type LabSession struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user"`
	Container string    `json:"container"`
	URL       string    `json:"url"`
	ClassCode string    `json:"class_code"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type Task struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	CourseID string `gorm:"index;uniqueIndex:idx_course_folder" json:"course_id"`
	Title    string `json:"title"`
	Folder   string `gorm:"uniqueIndex:idx_course_folder" json:"folder"`
}


type UserTaskProgress struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index" json:"user_id"`
	TaskID      uint      `gorm:"index" json:"task_id"`
	Task        Task      `gorm:"foreignKey:TaskID" json:"task"`
	Completed   bool      `json:"completed"`
	CompletedAt time.Time `json:"completed_at"`
}

func InitDB() {
	var err error

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dbHost := os.Getenv("DB_HOST")
		if dbHost == "" { dbHost = "localhost" }
		dbUser := os.Getenv("DB_USER")
		if dbUser == "" { dbUser = "admin" }
		dbPass := os.Getenv("DB_PASSWORD")
		if dbPass == "" { dbPass = "cloudmaster" }
		dbName := os.Getenv("DB_NAME")
		if dbName == "" { dbName = "cloudmaster" }

		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=5432 sslmode=disable TimeZone=UTC", dbHost, dbUser, dbPass, dbName)
	}

	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected successfully!")

	err = DB.AutoMigrate(&User{}, &LabSession{}, &Task{}, &UserTaskProgress{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed Tasks
	var taskCount int64
	DB.Model(&Task{}).Count(&taskCount)
	if taskCount == 0 {
		tasks := []Task{
			{CourseID: "kubernetes", Title: "K8s Pods Basics", Folder: "01-K8s-Pods"},
			{CourseID: "kubernetes", Title: "ReplicaSets", Folder: "02-K8s-ReplicaSets"},
			{CourseID: "kubernetes", Title: "Deployments", Folder: "03-K8s-Deployments"},
			{CourseID: "kubernetes", Title: "Services & Networking", Folder: "04-K8s-Services"},
			{CourseID: "kubernetes", Title: "ConfigMaps", Folder: "05-K8s-ConfigMaps"},
			{CourseID: "kubernetes", Title: "Secrets Management", Folder: "06-K8s-Secrets"},
			{CourseID: "kubernetes", Title: "Namespaces", Folder: "07-K8s-Namespaces"},
			{CourseID: "kubernetes", Title: "Persistent Volumes", Folder: "08-K8s-PVs"},
			{CourseID: "kubernetes", Title: "Ingress Controllers", Folder: "09-K8s-Ingress"},
			{CourseID: "kubernetes", Title: "RBAC Security", Folder: "10-K8s-RBAC"},
			{CourseID: "kubernetes", Title: "StatefulSets", Folder: "11-K8s-StatefulSets"},
			{CourseID: "kubernetes", Title: "DaemonSets", Folder: "12-K8s-DaemonSets"},
			{CourseID: "kubernetes", Title: "Jobs & CronJobs", Folder: "13-K8s-Jobs"},
			{CourseID: "kubernetes", Title: "HPA Auto-scaling", Folder: "14-K8s-HPA"},
			{CourseID: "kubernetes", Title: "Network Policies", Folder: "15-K8s-Network-Policies"},
			{CourseID: "kubernetes", Title: "Helm Packages", Folder: "16-K8s-Helm"},
			{CourseID: "kubernetes", Title: "Monitoring (Prometheus)", Folder: "17-K8s-Monitoring"},
			{CourseID: "kubernetes", Title: "Logging (ELK)", Folder: "18-K8s-Logging"},
			{CourseID: "kubernetes", Title: "CI/CD Gateways", Folder: "19-K8s-CI-CD"},
			{CourseID: "kubernetes", Title: "Final K8s Exam", Folder: "20-K8s-Final-Exam"},
		}
		for _, t := range tasks {
			DB.Create(&t)
		}
	}

	// 1. Initial Identity Synchronization
	fmt.Println("#########################################")
	fmt.Println("###   CNU IDENTITY SYSTEM STARTUP     ###")
	fmt.Println("#########################################")

	// a. Ensure Instructor exists
	// ADMIN_PASSWORD must be set via environment variable — no hardcoded default.
	adminEmail := "admin@cloudmaster.com"
	adminPass := os.Getenv("ADMIN_PASSWORD")
	if adminPass == "" {
		log.Println("[WARN] ADMIN_PASSWORD is not set. Instructor account will not be created. Set this variable in your .env file.")
	} else {
		var adminUser User
		if err := DB.Where("email = ?", adminEmail).First(&adminUser).Error; err != nil {
			DB.Create(&User{Name: "Prof. Admin", Email: adminEmail, Password: adminPass, Role: "instructor"})
		}
	}

	// b. Ensure Student (from Docker Env) exists/updated
	studentName := os.Getenv("STUDENT_NAME")
	if studentName == "" { studentName = os.Getenv("USER") }
	studentEmail := os.Getenv("STUDENT_EMAIL")
	if studentEmail == "" { studentEmail = os.Getenv("EMAIL") }
	studentPass := os.Getenv("STUDENT_KEY")
	if studentPass == "" { studentPass = os.Getenv("KEY") }

	if studentEmail != "" {
		if studentName == "" { studentName = "Cloud Student" }
		if studentPass == "" {
			log.Println("[WARN] STUDENT_KEY is not set. Set this variable in your .env file.")
			studentPass = "changeme"
		}

		var student User
		if err := DB.Where("email = ?", studentEmail).First(&student).Error; err != nil {
			// Create New Student
			fmt.Printf(">> PROVISIONING NEW STUDENT: %s (%s)\n", studentName, studentEmail)
			DB.Create(&User{
				Name:     studentName,
				Email:    studentEmail,
				Password: studentPass,
				Role:     "student",
			})
		} else {
			// Update Existing Key/Name just in case
			student.Name = studentName
			student.Password = studentPass
			DB.Save(&student)
		}
		
		fmt.Printf(">> MASTER IDENTITY: %s\n", studentEmail)
		fmt.Printf(">> CURRENT SECURITY KEY: %s\n", studentPass)
	}
	fmt.Println("#########################################")
}
