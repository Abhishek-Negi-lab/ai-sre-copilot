# AI SRE Copilot — DevOps Tool Map

## Backend

Path: apps/backend

Purpose:
Backend API for incidents, health, readiness, metrics, and AI analysis.

Important files:
- src/server.js
- src/db.js
- src/aiAnalyzer.js
- src/metrics.js
- db/schema.sql
- Dockerfile

## Frontend

Path: apps/frontend

Purpose:
React dashboard for incidents and system status.

Important files:
- src/App.jsx
- Dockerfile
- nginx.conf

## Docker Compose

File: docker-compose.yml

Purpose:
Runs full stack locally:
- postgres
- redis
- backend
- frontend
- prometheus
- grafana
- alertmanager

## Jenkins

Files:
- Jenkinsfile
- infra/jenkins/Dockerfile

Purpose:
CI/CD pipeline:
- build
- test/check
- Docker build
- Trivy scan
- Ansible deployment

## Ansible

Path: infra/ansible

Purpose:
Configure and deploy on EC2.

Playbooks:
- server-check.yml
- install-docker.yml
- deploy-app.yml

## Terraform

Path: infra/terraform/envs/dev

Purpose:
Create AWS infrastructure:
- Security Group
- EC2 instance

## Observability

Path: monitoring

Purpose:
Metrics, dashboards, alerts.

Files:
- monitoring/prometheus/prometheus.yml
- monitoring/prometheus/rules/backend-alerts.yml
- monitoring/alertmanager/alertmanager.yml

## Full Flow

GitHub → Jenkins → Docker Build → Trivy Scan → Ansible Deploy → EC2 → Prometheus → Grafana → Alertmanager
