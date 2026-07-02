pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "ai-sre-backend"
        FRONTEND_IMAGE = "ai-sre-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}"
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
                sh 'echo "Build number: ${BUILD_NUMBER}"'
                sh 'echo "Image tag: ${IMAGE_TAG}"'
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
                sh 'docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} --build-arg VITE_API_BASE_URL=http://localhost:5000 ./apps/frontend'
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
    }

    post {
        success {
            echo 'CI pipeline completed successfully.'
        }

        failure {
            echo 'CI pipeline failed. Check the failed stage and console logs.'
        }

        always {
            echo 'CI pipeline finished.'
        }
    }
}
