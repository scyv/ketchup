pipeline {
    agent any


    stages {
        stage('Checkout') {
            steps {
                dir('src') {
                    checkout scm
                }
            }
        }
        stage('Npm Install') {
            steps {
                dir('src') {
                    sh 'npm install --production'
                }
            }
        }
        stage('Build') {
            steps {
                dir('src') {
                    sh 'meteor build ../build --server https://ketchup.scytec.de --verbose'
                }
            }
        }
    }
}