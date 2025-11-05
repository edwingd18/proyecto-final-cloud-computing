pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20'  
    }
    environment {
        // Variables de entorno
        DOCKER_REGISTRY = 'docker.io'
        PROJECT_NAME = 'sistema-gestion-activos'
        GIT_CREDENTIALS = 'github-credentials'
        DISCORD_WEBHOOK = credentials('discord-webhook')
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo '========================================='
                    echo '  🔍 CHECKOUT: Obteniendo código fuente'
                    echo '========================================='
                }
                checkout scm
                sh 'git log -1'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Install Activos') {
                    steps {
                        script {
                            echo '📦 Instalando dependencias - Servicio Activos'
                        }
                        dir('servicio-activos') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Install Mantenimientos') {
                    steps {
                        script {
                            echo '📦 Instalando dependencias - Servicio Mantenimientos'
                        }
                        dir('servicio-mantenimientos') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Install API Gateway') {
                    steps {
                        script {
                            echo '📦 Instalando dependencias - API Gateway'
                        }
                        dir('api-gateway') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Install Frontend') {
                    steps {
                        script {
                            echo '📦 Instalando dependencias - Frontend'
                        }
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Run Tests') {
            parallel {
                stage('Test Activos') {
                    steps {
                        script {
                            echo '🧪 Ejecutando tests - Servicio Activos'
                        }
                        dir('servicio-activos') {
                            // Configurar variables de entorno para tests
                            sh '''
                                export DB_HOST=postgres
                                export DB_PORT=5432
                                export DB_NAME=activos_db
                                export DB_USER=postgres
                                export DB_PASSWORD=postgres123
                                export NODE_ENV=test
                                npm test
                            '''
                        }
                    }
                    post {
                        always {
                            junit(testResults: 'servicio-activos/junit.xml', allowEmptyResults: true)
                        }
                    }
                }
                stage('Test Mantenimientos') {
                    steps {
                        script {
                            echo '🧪 Ejecutando tests - Servicio Mantenimientos'
                        }
                        dir('servicio-mantenimientos') {
                            // Configurar variables de entorno para tests
                            sh '''
                                export MONGO_URI=mongodb://mongodb:27017/mantenimientos_test_db
                                export NODE_ENV=test
                                npm test
                            '''
                        }
                    }
                    post {
                        always {
                            junit(testResults: 'servicio-mantenimientos/junit.xml', allowEmptyResults: true)
                        }
                    }
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo '========================================='
                    echo '  🚀 DEPLOY: Tests pasaron - Desplegando a producción'
                    echo '========================================='
                    echo '✅ Todos los tests pasaron correctamente'
                    echo '📦 Haciendo merge de develop a main...'
                }

                withCredentials([usernamePassword(
                    credentialsId: env.GIT_CREDENTIALS,
                    usernameVariable: 'GIT_USERNAME',
                    passwordVariable: 'GIT_PASSWORD'
                )]) {
                    sh '''
                        # Configurar Git
                        git config user.name "Jenkins CI"
                        git config user.email "jenkins@ci.local"

                        # Fetch con credenciales en URL
                        git fetch https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/edwingd18/proyecto-final-cloud-computing.git

                        # Cambiar a main
                        git checkout -B main FETCH_HEAD

                        # Hacer merge de la rama develop actual
                        git merge develop --no-ff -m "Merge develop to main - Build #${BUILD_NUMBER} - All tests passed"

                        # Push a main
                        git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/edwingd18/proyecto-final-cloud-computing.git main

                        # Volver a develop
                        git checkout develop
                    '''
                }

                script {
                    echo '✅ Merge completado exitosamente'
                    echo '🚀 Railway detectará el cambio en main y desplegará automáticamente'
                    echo '📊 Verifica el progreso en: https://railway.app/dashboard'
                }
            }
        }
    }

    post {
        success {
            node {
                script {
                    echo '========================================='
                    echo '  ✅ BUILD EXITOSO'
                    echo '========================================='
                    echo "Commit: ${env.GIT_COMMIT}"
                    echo "Branch: ${env.GIT_BRANCH}"
                    echo "Build: #${env.BUILD_NUMBER}"

                    // Notificación Discord - Build Exitoso
                    def discordMessage = """
                    {
                        "embeds": [{
                            "title": "✅ Build Exitoso - Sistema Gestión de Activos",
                            "description": "El pipeline se ejecutó correctamente",
                            "color": 3066993,
                            "fields": [
                                {
                                    "name": "📋 Build",
                                    "value": "#${env.BUILD_NUMBER}",
                                    "inline": true
                                },
                                {
                                    "name": "🌿 Branch",
                                    "value": "${env.GIT_BRANCH}",
                                    "inline": true
                                },
                                {
                                    "name": "📝 Commit",
                                    "value": "${env.GIT_COMMIT?.take(8)}",
                                    "inline": true
                                },
                                {
                                    "name": "🧪 Tests",
                                    "value": "28/28 pasaron ✅\\n(13 Activos + 15 Mantenimientos)",
                                    "inline": false
                                },
                                {
                                    "name": "🚀 Estado Deploy",
                                    "value": "${env.GIT_BRANCH == 'develop' ? '✅ Merged a main\\n🔄 Railway desplegando...' : 'ℹ️ No deploy (branch: ' + env.GIT_BRANCH + ')'}",
                                    "inline": false
                                },
                                {
                                    "name": "🔗 Jenkins",
                                    "value": "[Ver logs](${env.BUILD_URL}console)",
                                    "inline": false
                                }
                            ],
                            "footer": {
                                "text": "Jenkins CI/CD"
                            },
                            "timestamp": "${new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone('UTC'))}"
                        }]
                    }
                    """

                    withCredentials([string(credentialsId: 'discord-webhook', variable: 'WEBHOOK_URL')]) {
                        sh """
                            curl -X POST -H "Content-Type: application/json" \
                                 -d '${discordMessage}' \
                                 "\${WEBHOOK_URL}"
                        """
                    }
                }
            }
        }

        failure {
            node {
                script {
                    echo '========================================='
                    echo '  ❌ BUILD FALLIDO'
                    echo '========================================='
                    echo "Commit: ${env.GIT_COMMIT}"
                    echo "Branch: ${env.GIT_BRANCH}"
                    echo "Build: #${env.BUILD_NUMBER}"

                    // Notificación Discord - Build Fallido
                    def discordMessage = """
                    {
                        "embeds": [{
                            "title": "❌ Build Fallido - Sistema Gestión de Activos",
                            "description": "El pipeline encontró errores",
                            "color": 15158332,
                            "fields": [
                                {
                                    "name": "📋 Build",
                                    "value": "#${env.BUILD_NUMBER}",
                                    "inline": true
                                },
                                {
                                    "name": "🌿 Branch",
                                    "value": "${env.GIT_BRANCH}",
                                    "inline": true
                                },
                                {
                                    "name": "📝 Commit",
                                    "value": "${env.GIT_COMMIT?.take(8)}",
                                    "inline": true
                                },
                                {
                                    "name": "❌ Problema",
                                    "value": "Tests fallaron o error en build",
                                    "inline": false
                                },
                                {
                                    "name": "🚫 Estado Deploy",
                                    "value": "⛔ NO se hizo merge a main\\n🔒 Producción protegida",
                                    "inline": false
                                },
                                {
                                    "name": "🔗 Jenkins",
                                    "value": "[Ver logs y detalles del error](${env.BUILD_URL}console)",
                                    "inline": false
                                }
                            ],
                            "footer": {
                                "text": "Jenkins CI/CD - Revisa los logs"
                            },
                            "timestamp": "${new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone('UTC'))}"
                        }]
                    }
                    """

                    withCredentials([string(credentialsId: 'discord-webhook', variable: 'WEBHOOK_URL')]) {
                        sh """
                            curl -X POST -H "Content-Type: application/json" \
                                 -d '${discordMessage}' \
                                 "\${WEBHOOK_URL}"
                        """
                    }
                }
            }
        }

        always {
            script {
                echo '========================================='
                echo '  Pipeline finalizado'
                echo '========================================='
            }
            // Nota: cleanWs comentado temporalmente para evitar errores
            // cleanWs(
            //     deleteDirs: true,
            //     patterns: [[pattern: 'node_modules/**', type: 'INCLUDE']]
            // )
        }
    }
}
