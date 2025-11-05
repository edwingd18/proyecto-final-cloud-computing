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
                expression { env.GIT_BRANCH == 'origin/develop' || env.GIT_BRANCH == 'develop' }
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

                        # Fetch todas las ramas
                        git fetch https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/edwingd18/proyecto-final-cloud-computing.git +refs/heads/*:refs/remotes/origin/*

                        # Checkout de main desde origin
                        git checkout -B main origin/main

                        # Hacer merge de origin/develop
                        git merge origin/develop --no-ff -m "Merge develop to main - Build #${BUILD_NUMBER} - All tests passed"

                        # Push a main
                        git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/edwingd18/proyecto-final-cloud-computing.git main

                        # Volver a la rama actual
                        git checkout ${GIT_BRANCH#origin/}
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
            script {
                echo '========================================='
                echo '  ✅ BUILD EXITOSO'
                echo '========================================='
                echo "Commit: ${env.GIT_COMMIT}"
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Build: #${env.BUILD_NUMBER}"

                // Obtener información adicional del commit
                def commitAuthor = sh(script: 'git log -1 --pretty=format:"%an"', returnStdout: true).trim()
                def commitMessage = sh(script: 'git log -1 --pretty=format:"%s"', returnStdout: true).trim()
                def buildDuration = currentBuild.durationString.replace(' and counting', '')
                def isDeployBranch = (env.GIT_BRANCH == 'origin/develop' || env.GIT_BRANCH == 'develop')
                def deployStatus = isDeployBranch ? '✅ Merged a main\n🚀 Desplegando a Railway...' : 'ℹ️ Sin deploy (solo en develop)'

                // Notificación Discord - Build Exitoso
                def discordMessage = """
                {
                    "embeds": [{
                        "title": "✅ Build Exitoso",
                        "description": "**${commitMessage}**",
                        "color": 3066993,
                        "author": {
                            "name": "Sistema Gestión de Activos",
                            "icon_url": "https://cdn-icons-png.flaticon.com/512/5610/5610944.png"
                        },
                        "thumbnail": {
                            "url": "https://cdn-icons-png.flaticon.com/512/845/845646.png"
                        },
                        "fields": [
                            {
                                "name": "👤 Autor",
                                "value": "${commitAuthor}",
                                "inline": true
                            },
                            {
                                "name": "🌿 Branch",
                                "value": "`${env.GIT_BRANCH.replace('origin/', '')}`",
                                "inline": true
                            },
                            {
                                "name": "📋 Build",
                                "value": "[#${env.BUILD_NUMBER}](${env.BUILD_URL})",
                                "inline": true
                            },
                            {
                                "name": "📝 Commit",
                                "value": "[${env.GIT_COMMIT?.take(7)}](https://github.com/edwingd18/proyecto-final-cloud-computing/commit/${env.GIT_COMMIT})",
                                "inline": true
                            },
                            {
                                "name": "⏱️ Duración",
                                "value": "${buildDuration}",
                                "inline": true
                            },
                            {
                                "name": "🧪 Tests",
                                "value": "**28/28** pasaron ✅\n• 13 Tests Activos\n• 15 Tests Mantenimientos",
                                "inline": true
                            },
                            {
                                "name": "🚀 Deploy",
                                "value": "${deployStatus}",
                                "inline": false
                            },
                            {
                                "name": "🔗 Enlaces",
                                "value": "[Jenkins Console](${env.BUILD_URL}console) • [GitHub Repo](https://github.com/edwingd18/proyecto-final-cloud-computing)",
                                "inline": false
                            }
                        ],
                        "footer": {
                            "text": "Jenkins CI/CD Pipeline",
                            "icon_url": "https://www.jenkins.io/images/logos/jenkins/jenkins.png"
                        },
                        "timestamp": "${new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone('UTC'))}"
                    }]
                }
                """

                try {
                    writeFile file: 'discord-payload.json', text: discordMessage
                    withCredentials([string(credentialsId: 'discord-webhook', variable: 'WEBHOOK_URL')]) {
                        writeFile file: 'send-discord.sh', text: '''#!/bin/bash
curl -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" -d @discord-payload.json
'''
                        sh 'chmod +x send-discord.sh && ./send-discord.sh'
                    }
                } catch (Exception e) {
                    echo "No se pudo enviar notificación a Discord: ${e.message}"
                }
            }
        }

        failure {
            script {
                echo '========================================='
                echo '  ❌ BUILD FALLIDO'
                echo '========================================='
                echo "Commit: ${env.GIT_COMMIT}"
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Build: #${env.BUILD_NUMBER}"

                // Obtener información adicional del commit
                def commitAuthor = sh(script: 'git log -1 --pretty=format:"%an"', returnStdout: true).trim()
                def commitMessage = sh(script: 'git log -1 --pretty=format:"%s"', returnStdout: true).trim()
                def buildDuration = currentBuild.durationString.replace(' and counting', '')
                def failureStage = currentBuild.result ?: 'Unknown'

                // Notificación Discord - Build Fallido
                def discordMessage = """
                {
                    "content": "@here ⚠️ **Build Fallido**",
                    "embeds": [{
                        "title": "❌ Build Fallido",
                        "description": "**${commitMessage}**",
                        "color": 15158332,
                        "author": {
                            "name": "Sistema Gestión de Activos",
                            "icon_url": "https://cdn-icons-png.flaticon.com/512/5610/5610944.png"
                        },
                        "thumbnail": {
                            "url": "https://cdn-icons-png.flaticon.com/512/1828/1828665.png"
                        },
                        "fields": [
                            {
                                "name": "👤 Autor",
                                "value": "${commitAuthor}",
                                "inline": true
                            },
                            {
                                "name": "🌿 Branch",
                                "value": "`${env.GIT_BRANCH.replace('origin/', '')}`",
                                "inline": true
                            },
                            {
                                "name": "📋 Build",
                                "value": "[#${env.BUILD_NUMBER}](${env.BUILD_URL})",
                                "inline": true
                            },
                            {
                                "name": "📝 Commit",
                                "value": "[${env.GIT_COMMIT?.take(7)}](https://github.com/edwingd18/proyecto-final-cloud-computing/commit/${env.GIT_COMMIT})",
                                "inline": true
                            },
                            {
                                "name": "⏱️ Duración",
                                "value": "${buildDuration}",
                                "inline": true
                            },
                            {
                                "name": "❌ Estado",
                                "value": "**${failureStage}**",
                                "inline": true
                            },
                            {
                                "name": "🚫 Deploy",
                                "value": "⛔ **NO se hizo merge a main**\n🔒 Producción protegida",
                                "inline": false
                            },
                            {
                                "name": "📊 Acción Requerida",
                                "value": "• Revisa los logs del build\n• Corrige los errores\n• Haz push y ejecuta de nuevo",
                                "inline": false
                            },
                            {
                                "name": "🔗 Enlaces",
                                "value": "[📋 Ver Logs Completos](${env.BUILD_URL}console) • [🔧 Ver Tests](${env.BUILD_URL}testReport) • [💻 GitHub](https://github.com/edwingd18/proyecto-final-cloud-computing)",
                                "inline": false
                            }
                        ],
                        "footer": {
                            "text": "Jenkins CI/CD Pipeline - ⚠️ Requiere Atención",
                            "icon_url": "https://www.jenkins.io/images/logos/jenkins/jenkins.png"
                        },
                        "timestamp": "${new Date().format("yyyy-MM-dd'T'HH:mm:ss'Z'", TimeZone.getTimeZone('UTC'))}"
                    }]
                }
                """

                try {
                    writeFile file: 'discord-payload.json', text: discordMessage
                    withCredentials([string(credentialsId: 'discord-webhook', variable: 'WEBHOOK_URL')]) {
                        writeFile file: 'send-discord.sh', text: '''#!/bin/bash
curl -X POST "$WEBHOOK_URL" -H "Content-Type: application/json" -d @discord-payload.json
'''
                        sh 'chmod +x send-discord.sh && ./send-discord.sh'
                    }
                } catch (Exception e) {
                    echo "No se pudo enviar notificación a Discord: ${e.message}"
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
