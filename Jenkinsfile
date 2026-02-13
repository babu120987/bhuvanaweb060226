pipeline {
  agent { label 'wsl' }
  ...
}
pipeline {
  agent { label 'wsl' }
  triggers { githubPush() }

  stages {
    stage('Diagnostics') {
      steps { sh 'whoami; hostname; docker --version; command -v docker' }
    }
    stage('Build') {
      steps { sh 'docker build -t bhuvanaweb:latest .' }
    }
    stage('Test') {
      steps {
        sh '''
          docker rm -f bhuvanaweb-test || true
          docker run -d --name bhuvanaweb-test -p 8089:80 bhuvanaweb:latest
          sleep 3
          curl -fsS http://localhost:8089 >/dev/null
          docker rm -f bhuvanaweb-test
        '''
      }
    }
    stage('Deploy') {
      steps {
        sh '''
          docker rm -f bhuvanaweb || true
          docker run -d --name bhuvanaweb -p 9999:80 --restart unless-stopped bhuvanaweb:latest
        '''
      }
    }
  }
}
