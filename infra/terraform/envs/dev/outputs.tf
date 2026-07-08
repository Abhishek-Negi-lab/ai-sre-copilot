output "aws_account_id" {
  description = "AWS account ID used by Terraform"
  value       = data.aws_caller_identity.current.account_id
  sensitive   = true
}

output "aws_region" {
  description = "AWS region used by Terraform"
  value       = data.aws_region.current.name
}
