pipeline {
  agent any

  environment {
    AWS_REGION = 'eu-west-1'
    ECR_BACKEND = '949527796968.dkr.ecr.eu-west-1.amazonaws.com/books-backend'
    ECR_FRONTEND = '949527796968.dkr.ecr.eu-west-1.amazonaws.com/books-frontend'
    CLUSTER_NAME = 'books-ecommerce-dev-eks'
    K8S_NAMESPACE = 'default'
    AWS_CREDENTIALS = credentials('aws-main-creds') // <-- Use your Jenkins credentials ID
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/ameyarane/BooksEcommerce.git'
      }
    }
    stage('Backend Build & Push') {
      steps {
        sh '''
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BACKEND
          docker build -f Backend/BooksEcommerce.Api/Dockerfile -t $ECR_BACKEND:latest .
          docker push $ECR_BACKEND:latest
        '''
      }
    }
    stage('Frontend Build & Push') {
      steps {
        sh '''
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_FRONTEND
          docker build -t $ECR_FRONTEND:latest ./Frontend
          docker push $ECR_FRONTEND:latest
        '''
      }
    }
    stage('Deploy to EKS') {
      steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: env.AWS_CREDENTIALS]]) {
          sh '''
            aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
            kubectl set image deployment/books-backend books-backend=$ECR_BACKEND:latest -n $K8S_NAMESPACE
            kubectl set image deployment/books-frontend books-frontend=$ECR_FRONTEND:latest -n $K8S_NAMESPACE
          '''
        }
      }
    }
  }
  post {
    failure {
      echo 'Pipeline failed!'
    }
    success {
      echo 'Pipeline succeeded!'
    }
  }
}
