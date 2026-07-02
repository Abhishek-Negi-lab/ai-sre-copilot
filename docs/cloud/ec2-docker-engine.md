# EC2 Docker Engine Setup Notes

## Goal

Install Docker Engine and Docker Compose on Ubuntu EC2 for production-style container deployment.

## Server

- AWS EC2
- Ubuntu
- Instance type: t2.micro

## Verification Commands

```bash
docker --version
docker compose version
docker run --rm hello-world
systemctl status docker
groups
Result
Docker Engine is installed and running as a systemd service.

Docker Compose is available.

The ubuntu user is part of the docker group.

Important Learning
Production Linux servers use Docker Engine, not Docker Desktop.

Docker Desktop is mainly for local development on Windows/Mac.

Production Notes
Docker service should be enabled and running.
Non-root users should be added to docker group carefully.
Access to docker group is powerful and should be restricted.
Docker daemon logs can be checked using journalctl.
Containers should run with proper environment variables, volumes, and restart policy.
