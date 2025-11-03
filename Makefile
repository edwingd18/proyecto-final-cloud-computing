.PHONY: help build up down logs clean test install

# Colores para output
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m # No Color

help: ## Mostrar esta ayuda
	@echo "$(GREEN)Comandos disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

install: ## Instalar dependencias de todos los servicios
	@echo "$(GREEN)Instalando dependencias...$(NC)"
	cd servicio-activos && npm install
	cd servicio-mantenimientos && npm install
	cd api-gateway && npm install
	cd frontend && npm install

build: ## Construir todas las imágenes Docker
	@echo "$(GREEN)Construyendo imágenes Docker...$(NC)"
	docker-compose build

up: ## Levantar todos los servicios
	@echo "$(GREEN)Iniciando servicios...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Servicios iniciados:$(NC)"
	@echo "  - API Gateway:             http://localhost:3000"
	@echo "  - Servicio Activos:        http://localhost:3001"
	@echo "  - Servicio Mantenimientos: http://localhost:3002"
	@echo "  - Frontend:                http://localhost:3003"
	@echo "  - Jenkins:                 http://localhost:8080/jenkins"

down: ## Detener todos los servicios
	@echo "$(YELLOW)Deteniendo servicios...$(NC)"
	docker-compose down

logs: ## Ver logs de todos los servicios
	docker-compose logs -f

logs-activos: ## Ver logs del servicio de activos
	docker-compose logs -f servicio-activos

logs-mantenimientos: ## Ver logs del servicio de mantenimientos
	docker-compose logs -f servicio-mantenimientos

logs-gateway: ## Ver logs del API gateway
	docker-compose logs -f api-gateway

logs-frontend: ## Ver logs del frontend
	docker-compose logs -f frontend

clean: ## Limpiar contenedores, volúmenes e imágenes
	@echo "$(YELLOW)Limpiando...$(NC)"
	docker-compose down -v
	docker system prune -f

restart: down up ## Reiniciar todos los servicios

test-activos: ## Ejecutar tests del servicio de activos
	cd servicio-activos && npm test

test-mantenimientos: ## Ejecutar tests del servicio de mantenimientos
	cd servicio-mantenimientos && npm test

test: test-activos test-mantenimientos ## Ejecutar todos los tests

dev-activos: ## Ejecutar servicio de activos en modo desarrollo
	cd servicio-activos && npm run dev

dev-mantenimientos: ## Ejecutar servicio de mantenimientos en modo desarrollo
	cd servicio-mantenimientos && npm run dev

dev-gateway: ## Ejecutar API gateway en modo desarrollo
	cd api-gateway && npm run dev

dev-frontend: ## Ejecutar frontend en modo desarrollo
	cd frontend && npm run dev

status: ## Ver estado de los servicios
	docker-compose ps

shell-activos: ## Abrir shell en contenedor de activos
	docker-compose exec servicio-activos sh

shell-mantenimientos: ## Abrir shell en contenedor de mantenimientos
	docker-compose exec servicio-mantenimientos sh

shell-postgres: ## Abrir shell en PostgreSQL
	docker-compose exec postgres psql -U postgres -d activos_db

shell-mongo: ## Abrir shell en MongoDB
	docker-compose exec mongodb mongosh mantenimientos_db

jenkins-start: ## Iniciar Jenkins
	@echo "$(GREEN)Iniciando Jenkins...$(NC)"
	docker-compose up -d jenkins
	@echo "$(GREEN)Jenkins iniciado en: http://localhost:8080/jenkins$(NC)"

jenkins-password: ## Obtener contraseña inicial de Jenkins
	@echo "$(GREEN)Contraseña inicial de Jenkins:$(NC)"
	@docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

jenkins-logs: ## Ver logs de Jenkins
	docker-compose logs -f jenkins

jenkins-restart: ## Reiniciar Jenkins
	@echo "$(YELLOW)Reiniciando Jenkins...$(NC)"
	docker-compose restart jenkins

jenkins-shell: ## Abrir shell en Jenkins
	docker exec -it jenkins bash
