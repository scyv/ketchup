pipeline {
    agent any

    dir('src') {
        checkout scm
    }

    stages {
        stage('Npm Install') {
            steps {
                sh 'npm install --production'
            }
        }
        stage('Build') {
            steps {
                sh 'meteor build ../build --server https://ketchup.scytec.de --verbose'
            }
        }
    }
}