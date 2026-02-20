pipeline {
  agent any

  triggers {
    githubPush()
  }

  environment {
    IMAGE_NAME      = "bhuvanaweb"
    IMAGE_TAG       = "latest"
    CONTAINER_NAME  = "bhuvanaweb_container"
    HOST_PORT       = "1000"
    CONTAINER_PORT  = "80"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh """
          docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
        """
      }
    }

    stage('Remove Existing Container (if any)') {
      steps {
        sh """
          docker rm -f ${CONTAINER_NAME} || true
        """
      }
    }

    stage('Run New Container') {
      steps {
        sh """
          docker run -d --name ${CONTAINER_NAME} -p ${HOST_PORT}:${CONTAINER_PORT} ${IMAGE_NAME}:${IMAGE_TAG}
          docker ps --filter "name=${CONTAINER_NAME}"
        """
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
