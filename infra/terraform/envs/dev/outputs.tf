output "aws_account_id" {
  description = "AWS account ID used by Terraform"
  value       = data.aws_caller_identity.current.account_id
  sensitive   = true
}

output "aws_region" {
  description = "AWS region used by Terraform"
  value       = var.aws_region
}

output "security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app.id
}

output "security_group_name" {
  description = "Name of the application security group"
  value       = aws_security_group.app.name
}
