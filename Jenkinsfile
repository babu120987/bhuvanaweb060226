pipeline {
    agent any

    environment {
        IMAGE_NAME = "bhuvanaweb"
        CONTAINER_NAME = "bhuvanaweb_container"
    }

    stages {

        stage('Pull from GitHub') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/babu120987/bhuvanaweb060226.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME:latest .
                '''
            }
        }

        stage('Test') {
            steps {
                sh '''
                echo "Running basic container test..."
                docker run -d --name test_container $IMAGE_NAME:latest
                sleep 5
                docker ps | grep test_container
                docker rm -f test_container
                '''
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker rm -f $CONTAINER_NAME || true
                docker run -d \
                  --name $CONTAINER_NAME \
                  -p 8080:80 \
                  $IMAGE_NAME:latest
                '''
            }
        }
    }

    post {
        success {
            echo "✅ CI/CD Pipeline completed successfully"
        }
        failure {
            echo "❌ CI/CD Pipeline failed"
        }
    }
}

