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

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH into EC2"
  type        = string
}

variable "allowed_app_cidr" {
  description = "CIDR allowed to access app ports"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  description = "Existing AWS EC2 key pair name"
  type        = string
}
