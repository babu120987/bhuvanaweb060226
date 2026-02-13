pipeline {
  agent { label 'wsl' }

  triggers {
    githubPush()
  }

  environment {
    IMAGE = "bhuvanaweb:latest"
    TEST_CONTAINER = "bhuvanaweb-test"
    PROD_CONTAINER = "bhuvanaweb"
  }

  stages {
    stage('Diagnostics') {
      steps {
        sh '''
          echo "=== WHO/WHERE ==="
          whoami
          hostname
          uname -a

          echo "=== DOCKER ==="
          command -v docker
          docker --version
        '''
      }
    }

    stage('Build') {
      steps {
        sh '''
          docker build -t ${IMAGE} .
        '''
      }
    }

    stage('Test') {
      steps {
        sh '''
          docker rm -f ${TEST_CONTAINER} || true
          docker run -d --name ${TEST_CONTAINER} -p 8089:80 ${IMAGE}
          sleep 3
          curl -fsS http://localhost:8089 >/dev/null
          docker rm -f ${TEST_CONTAINER} || true
        '''
      }
    }

    stage('Deploy') {
      steps {
        sh '''
          docker rm -f ${PROD_CONTAINER} || true
          docker run -d --name ${PROD_CONTAINER} -p 9999:80 --restart unless-stopped ${IMAGE}
        '''
      }
    }
  }

  post {
    success {
      echo "✅ Pipeline success"
    }
    failure {
      echo "❌ Pipeline failed"
    }
    always {
      sh 'docker ps || true'
    }
  }
}
