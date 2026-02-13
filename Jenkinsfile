pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        IMAGE_NAME = "bhuvanaweb"
        IMAGE_TAG  = "latest"
        CONTAINER_NAME = "bhuvanaweb"
        TEST_CONTAINER = "bhuvanaweb-test"
        APP_PORT = "9999"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "📥 Checking out latest code..."
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image..."
                sh '''
                    /usr/bin/docker --version
                    /usr/bin/docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                '''
            }
        }

        stage('Test Container') {
            steps {
                echo "🧪 Testing Docker container..."
                sh '''
                    # Remove old test container if exists
                    /usr/bin/docker rm -f ${TEST_CONTAINER} || true

                    # Run test container on temporary port 8089
                    /usr/bin/docker run -d \
                        --name ${TEST_CONTAINER} \
                        -p 8089:80 \
                        ${IMAGE_NAME}:${IMAGE_TAG}

                    # Wait for container to start
                    sleep 5

                    # Simple curl test
                    curl -f http://localhost:8089 || exit 1

                    # Stop and remove test container
                    /usr/bin/docker rm -f ${TEST_CONTAINER}
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                echo "🚀 Deploying container..."
                sh '''
                    # Stop old container if running
                    /usr/bin/docker rm -f ${CONTAINER_NAME} || true

                    # Run new container on production port
                    /usr/bin/docker run -d \
                        --name ${CONTAINER_NAME} \
                        -p ${APP_PORT}:80 \
                        --restart unless-stopped \
                        ${IMAGE_NAME}:${IMAGE_TAG}
                '''
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully!"
        }
        failure {
            echo "❌ CI/CD Pipeline failed!"
        }
    }
}
