// =============================================================================
// CloudNative University — Community Edition (CE)
// API Route Handlers (Student & Community Tier)
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
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"cloudmaster-orchestrator/docker"

	"github.com/gin-gonic/gin"
)

type StartRequest struct {
	Email      string `json:"student_id"`
	CourseID   string `json:"course_id"`
	ExerciseID string `json:"exercise_id"`
	ClassCode  string `json:"class_code"`
}



type LoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func SetupRoutes(r *gin.Engine, manager *docker.LabManager) {
	api := r.Group("/api")
	{
		// New System Check for Gating versions
		api.GET("/system-mode", func(c *gin.Context) {
			license := os.Getenv("CNU_LICENSE")
			if license == "" {
				c.JSON(http.StatusOK, gin.H{"mode": "community", "features": []string{"labs", "terminal", "local_guide"}})
			} else {
				c.JSON(http.StatusOK, gin.H{"mode": "academic", "features": []string{"labs", "terminal", "local_guide", "sync", "admin", "exam_ready"}})
			}
		})

		api.GET("/lab-content", func(c *gin.Context) {
			course := c.DefaultQuery("course", "kubernetes")
			basePath := os.Getenv("LABSPACE_SOURCE_PATH")
			if basePath == "" {
				basePath = "/app/labs"
			}
			
			// Si el curso es 'kubernetes', mapeamos a la carpeta 'cnu_kubernetes'
			courseFolder := course
			if course == "kubernetes" {
				courseFolder = "cnu_kubernetes"
			} else if course == "docker" {
				courseFolder = "cnu_docker"
			} else if course == "compose" {
				courseFolder = "cnu_docker_compose"
			}

			fullPath := filepath.Join(basePath, courseFolder, "guia.json")
			log.Printf(">> LOADING LAB CONTENT: %s\n", fullPath)
			content, err := os.ReadFile(fullPath)
			if err != nil {
				log.Printf(">> ERROR LOADING LAB CONTENT: %v\n", err)
				c.JSON(http.StatusNotFound, gin.H{"error": "Lab guide content not found for " + course})
				return
			}

			c.Data(http.StatusOK, "application/json", content)
		})


		api.POST("/login", func(c *gin.Context) {
			var req LoginRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			var user User
			if err := DB.Where("LOWER(email) = LOWER(?) AND password = ?", req.Email, req.Password).First(&user).Error; err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Credenciales inválidas. Verifica tu correo y clave de seguridad."})
				return
			}

			c.JSON(http.StatusOK, gin.H{"user": user})
		})

		api.GET("/auth/auto", func(c *gin.Context) {
			name := os.Getenv("STUDENT_NAME")
			email := os.Getenv("STUDENT_EMAIL")

			if email == "" {
				c.JSON(http.StatusNotFound, gin.H{"error": "No auto user configured"})
				return
			}

			var user User
			if err := DB.Where("email = ?", email).First(&user).Error; err != nil {
				if name == "" {
					name = email
				}
				user = User{
					Name:     name,
					Email:    email,
					Password: "auto",
					Role:     "student",
				}
				DB.Create(&user)
			}
			c.JSON(http.StatusOK, user)
		})

		api.POST("/start", func(c *gin.Context) {
			var req StartRequest
			if err := c.ShouldBindJSON(&req); err != nil {
				log.Printf(">> START BIND ERROR: %v | Body: %v\n", err, c.Request.Body)
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			log.Printf(">> START REQUEST: student=%s course=%s exercise=%s\n", req.Email, req.CourseID, req.ExerciseID)

			// Apply safe defaults
			if req.Email == "" {
				req.Email = os.Getenv("STUDENT_EMAIL")
			}
			if req.CourseID == "" || req.CourseID == "null" {
				req.CourseID = "kubernetes"
			}
			if req.ExerciseID == "" {
				req.ExerciseID = "1"
			}
			if req.ClassCode == "" {
				req.ClassCode = "CNU"
			}

			var user User
			if err := DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
				user = User{Name: req.Email, Email: req.Email}
			}


			containerID, target, err := manager.StartContainer(context.Background(), user.Name, user.Email, req.CourseID, req.ExerciseID, req.ClassCode)
			if err != nil {
				log.Printf("ERROR STARTING CONTAINER: %v\n", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}


			// Construcción inteligente de la URL
			// Extraemos el host actual por el que nos llaman (ej: 192.168.212.171)
			reqHost := strings.Split(c.Request.Host, ":")[0]
			finalURL := ""

			if strings.HasPrefix(target, "http") {
				// Es un tunnel (URL completa)
				finalURL = target + "/?folder=/home/coder/project"
			} else {
				// Es un puerto local (mapear al host dinámico)
				finalURL = fmt.Sprintf("http://%s:%s/?folder=/home/coder/project", reqHost, target)
			}

			// Inserción en Postgres con ClassCode para agrupación
			if user.ID != 0 {
				DB.Create(&LabSession{
					UserID:    user.ID,
					Container: containerID,
					URL:       finalURL,
					ClassCode: req.ClassCode,
					Status:    "running",
					CreatedAt: time.Now(),
				})
			}

			c.JSON(http.StatusOK, gin.H{
				"message":      "Container started",
				"url":          finalURL,
				"container_id": containerID,
			})
		})

		// Sincronización P2P (Reciben datos masivos de los estudiantes en la Bóveda del Maestro)
		type P2PSession struct {
			ContainerID string `json:"container_id"`
			URL         string `json:"url"`
			Status      string `json:"status"`
		}
		type P2PTask struct {
			TaskID    uint `json:"task_id"`
			Completed bool `json:"completed"`
		}
		type SyncPayload struct {
			Email   string      `json:"email"`
			Name    string      `json:"name"`
			Tasks   []P2PTask   `json:"tasks"`
			Session *P2PSession `json:"session"`
		}

		api.POST("/sync", func(c *gin.Context) {
			license := os.Getenv("CNU_LICENSE")
			if license == "" {
				c.JSON(http.StatusForbidden, gin.H{"error": "Instructor Sync is an Academic feature."})
				return
			}
			var payload SyncPayload
			if err := c.ShouldBindJSON(&payload); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid sync payload format"})
				return
			}

			// 1. Asegurar que el estudiante existe en la Bóveda del Profesor
			var user User
			if err := DB.Where("email = ?", payload.Email).First(&user).Error; err != nil {
				user = User{Name: payload.Name, Email: payload.Email, Role: "student", Password: "P2P_SYNCED"}
				DB.Create(&user)
			} else if user.Name == payload.Email {
				user.Name = payload.Name
				DB.Save(&user)
			}

			// 2. Sincronizar Progreso de Labs (Upsert silent)
			for _, pt := range payload.Tasks {
				if pt.Completed {
					var p UserTaskProgress
					if err := DB.Where("user_id = ? AND task_id = ?", user.ID, pt.TaskID).First(&p).Error; err != nil {
						DB.Create(&UserTaskProgress{UserID: user.ID, TaskID: pt.TaskID, Completed: true, CompletedAt: time.Now()})
					}
				}
			}

			// 3. Sincronizar Sesión Activa (Si hay una para el Shadow Terminal)
			if payload.Session != nil && payload.Session.URL != "" {
				var sess LabSession
				if err := DB.Where("user_id = ? AND container = ?", user.ID, payload.Session.ContainerID).First(&sess).Error; err != nil {
					DB.Create(&LabSession{
						UserID:    user.ID,
						Container: payload.Session.ContainerID,
						URL:       payload.Session.URL,
						Status:    payload.Session.Status,
						CreatedAt: time.Now(),
					})
				} else {
					sess.URL = payload.Session.URL
					sess.Status = payload.Session.Status
					DB.Save(&sess)
				}
			}

			c.JSON(http.StatusOK, gin.H{"status": "Synced securely with Professor Vault"})
		})

		// GET /api/progress?email=...
		api.GET("/progress", func(c *gin.Context) {
			email := c.Query("email")
			if email == "" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
				return
			}

			var user User
			if err := DB.Where("email = ?", email).First(&user).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}

			var tasks []Task
			course := c.Query("course")
			if course != "" {
				DB.Where("course_id = ?", course).Find(&tasks)
			} else {
				DB.Find(&tasks)
			}

			var progress []UserTaskProgress
			DB.Where("user_id = ?", user.ID).Find(&progress)


			c.JSON(http.StatusOK, gin.H{
				"tasks":    tasks,
				"progress": progress,
			})
		})


		// POST /api/verify
		api.POST("/verify", func(c *gin.Context) {
			var req struct {
				Email  string `json:"email"`
				TaskID uint   `json:"task_id"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			var user User
			if err := DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
				return
			}

			var task Task
			if err := DB.First(&task, req.TaskID).Error; err != nil {
				c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
				return
			}

			safeEmail := strings.ReplaceAll(user.Email, "@", "_at_")
			safeEmail = strings.ReplaceAll(safeEmail, ".", "_")

			completed, err := manager.ExecuteTaskTest(context.Background(), safeEmail, task.CourseID, int(task.ID))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to run test script", "details": err.Error()})
				return
			}

			if completed {
				// Update progress in DB (Upsert)
				var prog UserTaskProgress
				result := DB.Where("user_id = ? AND task_id = ?", user.ID, task.ID).First(&prog)
				if result.Error != nil {
					// Create new
					DB.Create(&UserTaskProgress{
						UserID:      user.ID,
						TaskID:      task.ID,
						Completed:   true,
						CompletedAt: time.Now(),
					})
				} else if !prog.Completed {
					// Update existing
					prog.Completed = true
					prog.CompletedAt = time.Now()
					DB.Save(&prog)
				}
			}

			c.JSON(http.StatusOK, gin.H{
				"completed": completed,
			})
		})

		api.POST("/reset", func(c *gin.Context) {
			var req struct {
				Email string `json:"email"`
			}
			if err := c.ShouldBindJSON(&req); err != nil {
				log.Printf("ERROR BINDING RESET JSON: %v\n", err)
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			log.Printf("RESET REQUEST FOR: %s\n", req.Email)
			var user User
			if err := DB.Where("email = ?", req.Email).First(&user).Error; err == nil {
				// 1. Wipe completion status for this user in DB
				if err := DB.Exec("DELETE FROM user_task_progresses WHERE user_id = ?", user.ID).Error; err != nil {
					log.Printf("DB DELETE ERROR: %v\n", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear DB"})
					return
				}

				// 2. [EXTRA] Wipe the Physical Workspace for a TRUE reset
				// We need to derive the safeEmail path as done in docker/client.go
				safeEmail := strings.ReplaceAll(req.Email, "@", "_at_")
				safeEmail = strings.ReplaceAll(safeEmail, ".", "_")
				studentContentPath := "/tmp/cloudmaster_workspaces/" + safeEmail

				// Dangerous but requested: wipe the files to allow "pending" status on check
				if _, err := os.Stat(studentContentPath); err == nil {
					// Stop the container first to avoid locked files (using projectName like cm_email)
					projectName := "cm_" + safeEmail
					exec.Command("docker", "compose", "-p", projectName, "down", "-v", "--remove-orphans").Run()
					// Wipe directory
					os.RemoveAll(studentContentPath)
					log.Printf("PHYSICAL WORKSPACE WIPED: %s\n", studentContentPath)
				}
				
				c.JSON(http.StatusOK, gin.H{"message": "Progress and workspace reset successfully", "user_id": user.ID})
			} else {
				log.Printf("USER NOT FOUND IN DB: %s\n", req.Email)
				c.JSON(http.StatusNotFound, gin.H{"error": "User not found in progress records"})
			}
		})

		// --- Injection of Tiered Features (Pro/Academic) ---
		RegisterTierRoutes(api, manager)
	}
}
