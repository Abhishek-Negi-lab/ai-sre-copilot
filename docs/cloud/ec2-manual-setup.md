# EC2 Manual Setup Notes

## Instance

Purpose:

AI SRE Copilot manual deployment practice.

## Region

ap-south-1

## Instance Type

t2.micro

## Operating System

Ubuntu 26.04 LTS

## Security Group

Initial inbound rule:

- SSH 22 from my IP only

Application ports will be opened only when needed:

- 8080 for frontend
- 5000 for backend

## Cost Safety

- Stop EC2 when not using.
- Avoid NAT Gateway.
- Avoid Load Balancer initially.
- Avoid RDS initially.
- Use Docker Compose on one small EC2.
- Delete unused resources after practice.

## SSH

Private key is stored outside the project repo under ~/.ssh.

Never commit .pem files.

## Verification Commands Used

```bash
whoami
hostname
cat /etc/os-release
df -h
free -h
curl -s http://checkip.amazonaws.com
Production Lessons
SSH should be restricted to my IP.
Root login should not be used.
Private key must be protected with chmod 400.
EC2 public IP can change after stop/start unless Elastic IP is used.
Security groups act as virtual firewalls.
