pipeline {
  agent any

  environment {
    APP_NAME = "bhuvanaweb"
    IMAGE    = "bhuvanaweb:latest"
    K8S_DIR  = "k8s"
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Image') {
      steps {
        sh '''
          set -eux
          docker build -t ${IMAGE} .
        '''
      }
    }

    stage('Ensure Minikube Running') {
      steps {
        sh '''
          set -eux

          mkdir -p "$HOME/.minikube"

          # Start minikube if profile missing or cluster not running
          if ! minikube profile list 2>/dev/null | grep -q "^| minikube "; then
            echo "Minikube profile not found for this user. Starting minikube..."
            minikube start --driver=docker
          else
            minikube status || minikube start --driver=docker
          fi

          minikube status
          kubectl config use-context minikube
          kubectl cluster-info
        '''
      }
    }

    stage('Load Image Into Minikube') {
      steps {
        sh '''
          set -eux
          minikube image load ${IMAGE}
        '''
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh '''
          set -eux
          kubectl apply -f ${K8S_DIR}/deployment.yaml
          kubectl apply -f ${K8S_DIR}/service.yaml
          kubectl rollout status deployment/${APP_NAME} --timeout=180s
          kubectl get pods -o wide
          kubectl get svc ${APP_NAME} -o wide
        '''
      }
    }

    stage('Smoke Test (inside cluster)') {
      steps {
        sh '''
          set -eux
          kubectl run curl-test --rm -i --tty --image=curlimages/curl:8.5.0 --restart=Never -- \
            sh -lc "curl -sS http://${APP_NAME}:1001 | head -n 5"
        '''
      }
    }
  }

  post {
    success {
      echo "✅ Deployed to Kubernetes (minikube) with 2 replicas on service port 1001."
    }
    failure {
      echo "❌ Pipeline failed"
    }
  }
}
