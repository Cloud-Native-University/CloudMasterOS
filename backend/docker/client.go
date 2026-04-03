// =============================================================================
// CloudNative University — Community Edition (CE)
// Docker Lab Manager — Container provisioning & lifecycle management
//
// Author  : Victor S. Recio (@vsroot_)
// Contact : vsrecio@nixversity.com
// License : MIT
//
// AI Pair Programming: Antigravity (Google DeepMind) assisted in the design
// and development of this platform.
// =============================================================================
package docker


import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

type LabManager struct {
	cli *client.Client
}

func NewLabManager() (*LabManager, error) {
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		return nil, err
	}
	return &LabManager{cli: cli}, nil
}

func (m *LabManager) StartContainer(ctx context.Context, studentName, studentEmail, courseID, exerciseID, classCode string) (string, string, error) {
	rootLabsPath := os.Getenv("LABSPACE_SOURCE_PATH")
	if rootLabsPath == "" {
		rootLabsPath = "/app/labs"
	}

	// Map courseID to folder (e.g., "kubernetes" -> "cnu_kubernetes")
	courseFolder := courseID
	if courseID == "kubernetes" {
		courseFolder = "cnu_kubernetes"
	} else if courseID == "docker" {
		courseFolder = "cnu_docker"
	} else if courseID == "compose" {
		courseFolder = "cnu_docker_compose"
	} else if courseID == "docker-sandbox" {
		courseFolder = "cnu_docker_sandbox"
	} else if courseID == "docker-models" {
		courseFolder = "cnu_docker_models"
	} else if courseID == "docker-mcp" {
		courseFolder = "cnu_docker_mcp"
	} else if courseID == "docker-networking" {
		courseFolder = "cnu_docker_networking"
	} else if courseID == "docker-offload" {
		courseFolder = "cnu_docker_offload"
	} else if courseID == "podman" {
		courseFolder = "cnu_podman"
	} else if courseID == "golang" {
		courseFolder = "cnu_golang"
	} else if courseID == "python" {
		courseFolder = "cnu_python"
	}
	baseContentPath := filepath.Join(rootLabsPath, courseFolder)


	// Sanitizamos el correo para usarlo como identificador y persistir archivos
	safeEmail := strings.ReplaceAll(studentEmail, "@", "_at_")
	safeEmail = strings.ReplaceAll(safeEmail, ".", "_")
	studentContentPath := "/tmp/cloudmaster_workspaces/" + safeEmail + "/" + courseFolder

	// Ensure student workspace exists
	os.MkdirAll(filepath.Join(studentContentPath, "project"), 0755)

	// Copy all course project files into student workspace
	copySrc := filepath.Join(baseContentPath, "project") + "/."
	copyDst := filepath.Join(studentContentPath, "project") + "/"
	fmt.Printf(">> DEBUG: Massive project copy: %s to %s\n", copySrc, copyDst)

	
	if out, err := exec.Command("cp", "-a", copySrc, copyDst).CombinedOutput(); err != nil {
		fmt.Printf(">> ERROR: Copy operation failed: %s | %v\n", string(out), err)
	} else {
		fmt.Printf(">> SUCCESS: Lab files copied to student project folder\n")
	}

	projectName := "cm_" + safeEmail
	composeFile := filepath.Join(baseContentPath, "docker-compose.yml")
	hostLabsPath := os.Getenv("LAB_HOST_PATH")
	if hostLabsPath == "" {
		hostLabsPath = rootLabsPath
	}
	hostBaseContentPath := filepath.Join(hostLabsPath, courseFolder)
	hostComposeFile := filepath.Join(hostBaseContentPath, "docker-compose.yml")
	hostCheckersPath := filepath.Join(hostBaseContentPath, "checkers")




	// Usamos cnu_ + courseID como nombre de la imagen local
	imageName := "cnu_" + courseID


	cmd := exec.CommandContext(ctx, "docker", "compose", "-f", hostComposeFile, "-p", projectName, "up", "-d", "--build", "--remove-orphans")
	cmd.Dir = baseContentPath
	
	cmd.Env = append(os.Environ(),
		"CONTENT_PATH="+studentContentPath,
		"STUDENT_NAME="+studentName,
		"STUDENT_EMAIL="+studentEmail,
		"WORKSPACE_PORT=0",
		"LAB_IMAGE="+imageName,
		"CLASS_CODE="+classCode,
		"CHECKERS_PATH="+hostCheckersPath,
	)

	out, err := cmd.CombinedOutput()
	if err != nil {
	    return "", "", fmt.Errorf("failed to start container: %s | %v", string(out), err)
	}

	// Interrogar a Docker Compose para averiguar a qué puerto local efímero ruteó el IDE (puerto 8085)
	portCmd := exec.Command("docker", "compose", "-p", projectName, "-f", composeFile, "port", "workspace", "8085")
	portCmd.Env = cmd.Env
	portOut, portErr := portCmd.Output()
	if portErr != nil {
		return "", "", fmt.Errorf("failed to extract dynamic port mapping: %w", portErr)
	}
	// Optional: Fetch the Cloudflare tunnel URL if available
	tunnelURL := ""
	tunnelCmd := exec.Command("docker", "compose", "-p", projectName, "-f", composeFile, "exec", "tunneler", "wget", "-qO-", "http://127.0.0.1:2000/quicktunnel")
	tunnelCmd.Env = cmd.Env
	
	// Wait a moment for the tunnel to establish
	time.Sleep(3 * time.Second)
	if tunnelOut, err := tunnelCmd.Output(); err == nil {
		type QuickTunnel struct {
			Hostname string `json:"hostname"`
		}
		var qt QuickTunnel
		if json.Unmarshal(tunnelOut, &qt) == nil && qt.Hostname != "" {
			tunnelURL = qt.Hostname
		}
	}

	// Output format: "0.0.0.0:32768" or "127.0.0.1:55432"
	parts := strings.Split(strings.TrimSpace(string(portOut)), ":")
	dynamicPort := parts[len(parts)-1]

	// Devolvemos el puerto y si hay tunnel, el tunnel.
	// El handler se encargará de construir la URL final con el Host actual.
	finalTarget := dynamicPort
	if tunnelURL != "" {
		finalTarget = tunnelURL
	}
	return projectName, finalTarget, nil
}

type InstanceInfo struct {
	ID        string `json:"id"`
	StudentID string `json:"student_id"`
	Exercise  string `json:"exercise_id"`
	State     string `json:"state"`
}

func (m *LabManager) ListContainers(ctx context.Context) ([]InstanceInfo, error) {
	containers, err := m.cli.ContainerList(ctx, container.ListOptions{All: true})
	if err != nil {
		return nil, err
	}

	var instances []InstanceInfo
	for _, c := range containers {
		if c.Labels["cloudmaster"] == "true" {
			instances = append(instances, InstanceInfo{
				ID:        c.ID[:12],
				StudentID: c.Labels["student_id"],
				Exercise:  c.Labels["exercise_id"],
				State:     c.State,
			})
		}
	}
	return instances, nil
}
func (m *LabManager) ExecuteTaskTest(ctx context.Context, safeEmail, courseID string, taskID int) (bool, error) {
	projectName := "cm_" + safeEmail

	// Find the course folder
	courseFolder := courseID
	if courseID == "kubernetes" {
		courseFolder = "cnu_kubernetes"
	}
	
	rootLabsPath := os.Getenv("LABSPACE_SOURCE_PATH")
	if rootLabsPath == "" {
		rootLabsPath = "/app/labs"
	}
	checkersPath := filepath.Join(rootLabsPath, courseFolder, "checkers")
	
	// Find the script using a glob for the prefix (e.g., "01-*")
	prefix := fmt.Sprintf("%02d", taskID)
	matches, _ := filepath.Glob(filepath.Join(checkersPath, prefix+"*", "test.sh"))

	if len(matches) == 0 {
		return false, fmt.Errorf("checker script for task %d not found locally in %s", taskID, checkersPath)
	}
	
	// Get the relative path from the checkers root (e.g., "01-K8s-Pods/test.sh")
	relPath, err := filepath.Rel(checkersPath, matches[0])
	if err != nil {
		return false, fmt.Errorf("failed to get relative path: %v", err)
	}

	// NEW: The path inside the student container is ALWAYS /opt/cloudmaster/checkers/
	remoteTestScript := filepath.Join("/opt/cloudmaster/checkers", relPath)
	
	log.Printf("RUNNING VERIFICATION: Local=%s -> Remote=%s INSIDE %s\n", matches[0], remoteTestScript, projectName)

	// Check if test.sh exists inside the student container
	checkCmd := exec.CommandContext(ctx, "docker", "exec", projectName+"-workspace-1", "sh", "-c", fmt.Sprintf("[ -f %s ]", remoteTestScript))
	if err := checkCmd.Run(); err != nil {
		log.Printf("SKIP VERIFY: %s (Not found inside container)\n", remoteTestScript)
		return false, nil
	}

	cmd := exec.CommandContext(ctx, "docker", "exec", projectName+"-workspace-1", "bash", remoteTestScript)

	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("TASK %d FAILED: %s | %v\n", taskID, string(out), err)
		return false, nil
	}

	log.Printf("TASK %d SUCCESS: %s\n", taskID, string(out))
	return strings.Contains(strings.ToLower(string(out)), "success"), nil
}
