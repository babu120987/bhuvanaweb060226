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

      export MINIKUBE_HOME="$HOME"
      export KUBECONFIG="$HOME/.kube/config"

      # Try start; if it fails, wipe and recreate cleanly
      if ! minikube status >/dev/null 2>&1; then
        echo "Minikube not healthy. Recreating..."
        minikube delete --all --purge || true
        rm -rf "$HOME/.minikube" "$HOME/.kube"
      fi

      minikube start --driver=docker --kubernetes-version=v1.28.3

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
          kubectl apply -f ${K8S_DIR}/deployment.yml
          kubectl apply -f ${K8S_DIR}/service.yml
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
