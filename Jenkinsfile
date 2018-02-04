pipeline {
    agent any


    stages {
        stage('Checkout') {
            dir('src') {
                checkout scm
            }
        }
        stage('Npm Install') {
            dir('src') {
                steps {
                    sh 'npm install --production'
                }
            }
        }
        stage('Build') {
            dir('src') {
                steps {
                    sh 'meteor build ../build --server https://ketchup.scytec.de --verbose'
                }
            }
        }
    }
}