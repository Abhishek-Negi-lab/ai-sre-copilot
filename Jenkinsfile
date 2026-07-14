pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "ai-sre-backend"
        FRONTEND_IMAGE = "ai-sre-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
        EC2_PUBLIC_IP = "35.154.130.113"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code'
                checkout scm
            }
        }

        stage('Environment Info') {
            steps {
                sh 'whoami'
                sh 'pwd'
                sh 'node -v'
                sh 'npm -v'
                sh 'docker --version'
                sh 'docker compose version'
                sh 'ansible --version'
                sh 'echo "Build number: ${BUILD_NUMBER}"'
                sh 'echo "Image tag: ${IMAGE_TAG}"'
                sh 'echo "Deploy target EC2: ${EC2_PUBLIC_IP}"'
            }
        }

        stage('Backend Install') {
            steps {
                dir('apps/backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Backend Syntax Check') {
            steps {
                dir('apps/backend') {
                    sh 'npm run check'
                }
            }
        }

        stage('Frontend Install') {
            steps {
                dir('apps/frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('apps/frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Compose Config Validation') {
            steps {
                sh 'docker compose config'
            }
        }

        stage('Docker Build Backend') {
            steps {
                sh 'docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./apps/backend'
            }
        }

        stage('Docker Build Frontend') {
            steps {
                sh 'docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} --build-arg VITE_API_BASE_URL=http://${EC2_PUBLIC_IP}:5000 ./apps/frontend'
            }
        }

        stage('Docker Images') {
            steps {
                sh 'docker image ls | grep ai-sre || true'
            }
        }

        stage('Trivy Scan Backend Image') {
            steps {
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v trivy_cache:/root/.cache/ \
                      aquasec/trivy:latest image \
                      --scanners vuln \
                      --severity HIGH,CRITICAL \
                      --exit-code 0 \
                      ${BACKEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        stage('Trivy Scan Frontend Image') {
            steps {
                sh '''
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      -v trivy_cache:/root/.cache/ \
                      aquasec/trivy:latest image \
                      --scanners vuln \
                      --severity HIGH,CRITICAL \
                      --exit-code 0 \
                      ${FRONTEND_IMAGE}:${IMAGE_TAG}
                '''
            }
        }

        stage('Deploy to EC2 with Ansible') {
            steps {
                sshagent(credentials: ['ai-sre-ec2-ssh-key']) {
                    sh '''
                        mkdir -p infra/ansible/inventory

                        cat > infra/ansible/inventory/hosts.ini <<EOF
[app]
ai-sre-ec2 ansible_host=${EC2_PUBLIC_IP} ansible_user=ubuntu ansible_python_interpreter=/usr/bin/python3
