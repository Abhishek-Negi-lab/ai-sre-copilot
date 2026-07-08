variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project name used for tagging"
  type        = string
  default     = "ai-sre-copilot"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}
