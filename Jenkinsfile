kpipeline {
  agent any

  environment {
    APP_NAME = "bhuvanaweb"
    IMAGE    = "bhuvanaweb:latest"
    K8S_DIR  = "k8s"
  }

  options {
    timestamps()
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
          docker build -t "${IMAGE}" .
        '''
      }
    }

    stage('Ensure Minikube Running') {
      steps {
        sh '''
          set -eux

          export MINIKUBE_HOME="$HOME"
          export KUBECONFIG="$HOME/.kube/config"

          if ! minikube status >/dev/null 2>&1; then
            echo "Minikube not healthy. Recreating..."
            minikube delete --all --purge || true
            rm -rf "$HOME/.minikube" "$HOME/.kube" || true
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
          minikube image load "${IMAGE}"
        '''
      }
    }

    stage('Deploy to Kubernetes') {
      steps {
        sh '''
          set -eux

          kubectl apply -f "${K8S_DIR}/deployment.yml"
          kubectl apply -f "${K8S_DIR}/service.yml"

          kubectl rollout status "deployment/${APP_NAME}" --timeout=180s

          kubectl get pods -o wide
          kubectl get svc "${APP_NAME}" -o wide
        '''
      }
    }

    stage('Smoke Test (inside cluster)') {
      steps {
        sh '''
          set -eux

          kubectl run curl-test --rm -i --tty \
            --image=curlimages/curl:8.5.0 \
            --restart=Never -- \
            sh -lc "curl -sS http://${APP_NAME}:1001 | head -n 5"
        '''
      }
    }

    stage('NodePort Test (Jenkins machine)') {
      steps {
        sh '''
          set -eux

          MINIKUBE_IP=$(minikube ip)
          NODE_PORT=$(kubectl get svc "${APP_NAME}" -o jsonpath='{.spec.ports[0].nodePort}')

          echo "Minikube IP: ${MINIKUBE_IP}"
          echo "NodePort: ${NODE_PORT}"

          curl -I --max-time 10 "http://${MINIKUBE_IP}:${NODE_PORT}"
          curl -sS --max-time 10 "http://${MINIKUBE_IP}:${NODE_PORT}" | head -n 5
        '''
      }
    }

  }

  post {
    success {
      echo "✅ Deployed ${APP_NAME} to minikube and verified via NodePort."
    }
    failure {
      echo "❌ Pipeline failed. Check console output above."
    }
    always {
      sh '''
        set +e
        kubectl get pods -o wide || true
        kubectl get svc -o wide || true
      '''
    }
  }
}
