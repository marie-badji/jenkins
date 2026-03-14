pipeline {
    // Chaque stage choisit son propre environnement
    agent none

    stages {

        // ─────────────────────────────────────────
        // STAGE 1 — Installation et Build React
        // ─────────────────────────────────────────
        stage('Build React') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root'
                }
            }
            steps {
                sh "npm install --force"
                sh "npm run build"
                sh "mkdir -p staging && cp -r build/* staging/"
            }
        }

        // ─────────────────────────────────────────
        // STAGE 2 — Tests unitaires
        // ─────────────────────────────────────────
        stage('Unit Test') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-u root'
                }
            }
            steps {
                sh "npm install --force"
                sh "npm test -- --watchAll=false --passWithNoTests"
            }
        }

        // ─────────────────────────────────────────
        // STAGE 3 — Build et Push image Docker Hub
        // ─────────────────────────────────────────
        stage('Push to Docker Hub') {
            agent {
                docker {
                    image 'docker:25.0.3'
                    args '-u root -v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub_credentials',
                    passwordVariable: 'DOCKER_HUB_PASSWORD',
                    usernameVariable: 'DOCKER_HUB_USERNAME'
                )]) {
                    sh "docker login -u $DOCKER_HUB_USERNAME -p $DOCKER_HUB_PASSWORD"
                    sh "docker build -t $DOCKER_HUB_USERNAME/todo-front:v$BUILD_NUMBER ."
                    sh "docker push $DOCKER_HUB_USERNAME/todo-front:v$BUILD_NUMBER"
                }
            }
        }

        // ─────────────────────────────────────────
        // STAGE 4 — Deploy (avec confirmation manuelle)
        // ─────────────────────────────────────────
        stage('Deploy on Remote Server') {
            agent any
            steps {
                script {
                    // Demande de confirmation avant de déployer
                    def userInput = input(
                        message: 'Voulez-vous déployer sur le serveur distant ?',
                        ok: 'Déployer'
                    )

                    if (userInput != null) {
                        // /idrsa doit être montée comme un volume dans Jenkins
                        // La clé publique doit être dans ~/.ssh/authorized_keys du serveur distant
                        sh """
                            ssh -i /idrsa -o StrictHostKeyChecking=no user@remote.server.com '
                            docker pull $DOCKER_HUB_USERNAME/todo-front:v$BUILD_NUMBER &&
                            docker stop todo-front || true &&
                            docker rm todo-front || true &&
                            docker run -d --name todo-front -p 80:80 $DOCKER_HUB_USERNAME/todo-front:v$BUILD_NUMBER
                            '
                        """
                    }
                }
            }
        }

    }

    // ─────────────────────────────────────────
    // POST — Notifications fin de pipeline
    // ─────────────────────────────────────────
    post {
        success {
            echo "Pipeline build successfully"
        }
        failure {
            echo "Pipeline failed"
        }
    }
}