pipeline {
  agent any

  environment {
    IMAGE_NAME = "bhuvanaweb"
    IMAGE_TAG  = "latest"
    CONTAINER_NAME = "bhuvanaweb"
    HOST_PORT = "1000"
    CONTAINER_PORT = "80"
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
          if docker ps -a --format '{{.Names}}' | grep -w ${CONTAINER_NAME}; then
            echo "Stopping old container..."
            docker stop ${CONTAINER_NAME} || true
            echo "Removing old container..."
            docker rm ${CONTAINER_NAME} || true
          else
            echo "No existing container found."
          fi
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
    always {
      echo "Pipeline finished."
    }
  }
}
    always {
      sh 'docker ps || true'
    }
  }
}
