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

    stage('Load Image Into Minikube') {
      steps {
        sh '''
          set -eux
          minikube status
          # Load locally-built docker image into minikube
          minikube image load ${IMAGE}
        '''
      }
    }

    stage('Deploy to Kubernetes (Minikube)') {
      steps {
        sh '''
          set -eux
          kubectl config use-context minikube

          kubectl apply -f ${K8S_DIR}/deployment.yaml
          kubectl apply -f ${K8S_DIR}/service.yaml

          kubectl rollout status deployment/${APP_NAME} --timeout=120s
          kubectl get pods -o wide
          kubectl get svc ${APP_NAME} -o wide
        '''
      }
    }

    stage('Smoke Test (inside cluster)') {
      steps {
        sh '''
          set -eux
          # Test service from inside the cluster
          kubectl run curl-test --rm -i --tty --image=curlimages/curl:8.5.0 --restart=Never -- \
            curl -sS http://${APP_NAME}:1001 | head -n 5
        '''
      }
    }
  }

  post {
    success {
      echo "✅ Deployed to Minikube with 2 replicas. Service port is 1001."
    }
    failure {
      echo "❌ Pipeline failed"
    }
  }
}
