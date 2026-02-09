pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/babu120987/bhuvanaweb060226.git'
            }
        }

        stage('Build Image') {
            steps {
                sh 'docker build -t poseify-workspace:latest .'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker stop poseify-web || true
                docker rm poseify-web || true
                docker run -d -p 80:80 --name poseify-web poseify-workspace:latest
                '''
            }
        }
    }
}
