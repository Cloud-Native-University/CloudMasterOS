// =============================================================================
// CloudNative University — Community Edition (CE)
// Application Entry Point — Initializes API, database, and web server
//
// Author  : Victor S. Recio (@vsroot_)
// Contact : vsrecio@nixversity.com
// License : MIT
//
// AI Pair Programming: Antigravity (Google DeepMind) assisted in the design
// and development of this platform.
// =============================================================================
package main


import (
	"log"
	"os"

	"cloudmaster-orchestrator/api"
	"cloudmaster-orchestrator/docker"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	labManager, err := docker.NewLabManager()
	if err != nil {
		log.Fatalf("Failed to initialize Docker client: %v", err)
	}

	r := gin.Default()

	// Configure CORS for Frontend Development
	r.Use(cors.Default())

	// Initialize Database
	api.InitDB()

	// Initialize API Routes
	api.SetupRoutes(r, labManager)

	// Serve Frontend Static Files (Unified Mode)
	// Solo servimos explícitamente la carpeta de assets para evitar conflictos
	r.Static("/assets", "./static/assets")

	// El fallback inteligente para el resto (Imágenes, SPA, etc.)
	r.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		fullPath := "./static" + path

		// Si el archivo físico existe (ej: /img/logo.png), lo servimos
		if info, err := os.Stat(fullPath); err == nil && !info.IsDir() {
			c.File(fullPath)
			return
		}

		// En cualquier otro caso, servimos la SPA (index.html)
		c.File("./static/index.html")
	})

	log.Println("Starting CloudMaster Unified Engine on :8081")
	if err := r.Run(":8081"); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
