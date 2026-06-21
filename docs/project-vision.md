# Project Vision — AI SRE Copilot

## Problem

Production incidents are difficult to debug because logs, metrics, alerts, deployment history, and runbooks are usually scattered across multiple tools.

DevOps and SRE teams often need to check many places during an incident:

- Application logs
- Linux system health
- Network connectivity
- Docker container status
- Kubernetes pod status
- Deployment history
- Metrics dashboard
- Alerts
- Database health
- Recent code changes
- Runbooks

This increases mean time to detect and resolve issues.

## Solution

AI SRE Copilot will bring incident data into one dashboard and use AI to generate:

- Incident summary
- Possible root cause
- Debugging steps
- Rollback recommendation
- Postmortem report
- Production lesson

## MVP Scope

The first version will support:

1. Creating incidents manually
2. Adding logs and service health information
3. Asking AI to summarize the incident
4. Storing the AI analysis result
5. Displaying incident details in a dashboard
6. Running the app using Docker Compose
7. Deploying the app on AWS EC2
8. Building CI/CD using Jenkins
9. Provisioning infrastructure using Terraform
10. Configuring servers using Ansible
11. Deploying to Kubernetes locally
12. Monitoring with Prometheus and Grafana

## Future Scope

- EKS deployment
- Helm chart improvements
- Argo CD GitOps
- Loki production logging
- Alertmanager alert routing
- Slack/email notifications
- AWS RDS
- Secrets Manager
- Blue-green/canary deployment
- Load testing
- SLO/SLA/error budget
