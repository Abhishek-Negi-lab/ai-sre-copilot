# AWS Cost Safety Notes

## Region

Primary region for this project:

ap-south-1

## Cost Safety Rules

- Use only one small EC2 instance initially.
- Stop EC2 when not using.
- Avoid NAT Gateway initially.
- Avoid EKS initially.
- Avoid RDS initially.
- Avoid Load Balancer initially.
- Keep EBS volume small, around 8 GB.
- Do not create Elastic IP unless required.
- Delete unused resources.
- Set AWS Budget alert.

## Security Rules

- Root account must have MFA enabled.
- Do not use root account for daily work.
- Do not create root access keys.
- Do not commit AWS credentials to GitHub.
- Do not share access keys.
- Restrict SSH access to my IP only.
- Use IAM user/role for CLI and automation.

## Initial Deployment Plan

- Launch Ubuntu EC2.
- Install Docker Engine.
- Copy project or pull from GitHub.
- Run Docker Compose stack.
- Open only required ports in Security Group.
- Stop instance after practice.
