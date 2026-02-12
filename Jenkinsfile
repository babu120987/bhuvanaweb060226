pipeline {
  agent any

  triggers {
    githubPush()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh 'docker build -t bhuvanaweb:latest .'
      }
    }

    stage('Test Container') {
      steps {
        sh '''
          echo "Running basic container test..."
          docker rm -f test_container || true
          docker run -d --name test_container bhuvanaweb:latest
          sleep 5
          docker ps | grep test_container
          docker rm -f test_container
        '''
      }
    }

    stage('Run Container') {
      steps {
        sh '''
          docker rm -f bhuvanaweb_container || true
          docker run -d --name bhuvanaweb_container -p 9999:80 bhuvanaweb:latest
        '''
      }
    }
  }

  post {
    success {
      echo '✅ CI/CD Pipeline completed successfully'
    }
    failure {
      echo '❌ CI/CD Pipeline failed'
    }
  }
}
