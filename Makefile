.PHONY: up down prune

down:
	docker compose down --rmi local --remove-orphans --volumes

up: down
	docker compose up

dev: down
	docker compose -f compose.dev.yml up

prune:
	docker system prune -a
