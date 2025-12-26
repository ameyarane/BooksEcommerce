pipeline {
  agent any

  environment {
    AWS_REGION = 'eu-west-1'
    ECR_BACKEND = '949527796968.dkr.ecr.eu-west-1.amazonaws.com/books-backend'
    ECR_FRONTEND = '949527796968.dkr.ecr.eu-west-1.amazonaws.com/books-frontend'
    CLUSTER_NAME = 'books-ecommerce-dev-eks'
    K8S_NAMESPACE = 'default'
    AWS_CREDENTIALS = credentials('aws-main-creds') 
    BACKEND_API_URL = 'a5cde2fc5d38347a39392f0d8d460951-1244432574.eu-west-1.elb.amazonaws.com'
    ALLOWED_ORIGINS = 'http://frontend-url-1,http://frontend-url-2'
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
          docker build -f Backend/Dockerfile -t $ECR_BACKEND:latest .
          docker push $ECR_BACKEND:latest
        '''
      }
    }
    stage('Frontend Build & Push') {
      steps {
        sh '''
          echo "REACT_APP_API_BASE=https://${BACKEND_API_URL}/api/books" > ./Frontend/.env
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_FRONTEND
          docker build -t $ECR_FRONTEND:latest ./Frontend
          docker push $ECR_FRONTEND:latest
        '''
      }
    }

    stage('Verify AWS Auth') {
            steps {
                    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
                                    credentialsId: 'aws-main-creds']]) {
                        sh 'aws sts get-caller-identity'
                }
          }
      }

      stage('Deploy to EKS') {
          steps {
            withCredentials([[$class: 'AmazonWebServicesCredentialsBinding',
              credentialsId: 'aws-main-creds']]) {
              sh '''
                export KUBECONFIG=/var/lib/jenkins/.kube/config
                aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

                # Always ensure correct IRSA annotation for EBS CSI controller
                kubectl annotate serviceaccount ebs-csi-controller-sa \
                  -n kube-system \
                  eks.amazonaws.com/role-arn=arn:aws:iam::949527796968:role/EKS-EBS-CSI-controller --overwrite

                # --- SQL Server: apply PVC, Deployment, Service ---
                kubectl apply -f Backend/k8s/mssql-pvc.yaml
                kubectl apply -f Backend/k8s/mssql-deployment.yaml
                kubectl apply -f Backend/k8s/mssql-service.yaml

                # Deploy backend if not exists, otherwise update image
                if ! kubectl get deployment books-backend -n $K8S_NAMESPACE; then
                  kubectl apply -f Backend/k8s/deployment.yaml
                else
                  kubectl set image deployment/books-backend books-backend=$ECR_BACKEND:latest -n $K8S_NAMESPACE
                fi

                # Always apply backend service (creates or updates)
                kubectl apply -f Backend/k8s/service.yaml

                # Set/Update AllowedOrigins environment variable in backend deployment
                kubectl set env deployment/books-backend AllowedOrigins=$ALLOWED_ORIGINS -n $K8S_NAMESPACE

                # --- RUN EF CORE MIGRATION JOB ---
                echo "Running EF Core migrations..."
                kubectl delete job efcore-migrate -n $K8S_NAMESPACE || true
                kubectl apply -f Backend/k8s/efcore-migrate-job.yaml
                kubectl wait --for=condition=complete --timeout=180s job/efcore-migrate -n $K8S_NAMESPACE
                kubectl logs job/efcore-migrate -n $K8S_NAMESPACE

                # --- WAIT FOR BACKEND LOADBALANCER EXTERNAL-IP ---
                echo "Waiting for backend LoadBalancer EXTERNAL-IP..."
                for i in {1..20}; do
                  BACKEND_API_URL=$(kubectl get svc books-backend -n $K8S_NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
                  if [ ! -z "$BACKEND_API_URL" ]; then
                    echo "Backend API URL found: $BACKEND_API_URL"
                    break
                  fi
                  echo "Waiting for backend EXTERNAL-IP... ($i/20)"
                  sleep 15
                done

                if [ -z "$BACKEND_API_URL" ]; then
                  echo "ERROR: Backend LoadBalancer EXTERNAL-IP not found after waiting!"
                  exit 1
                fi

                # --- BUILD FRONTEND WITH DYNAMIC API ENDPOINT ---
                echo "REACT_APP_API_BASE=http://$BACKEND_API_URL/api/books" > ./Frontend/.env
                cd Frontend
                npm ci
                npm run build
                cd ..

                # --- Build and Push Frontend Image ---
                aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_FRONTEND
                docker build -t $ECR_FRONTEND:latest ./Frontend
                docker push $ECR_FRONTEND:latest

                # Deploy frontend if not exists, otherwise update image
                if ! kubectl get deployment books-frontend -n $K8S_NAMESPACE; then
                  kubectl apply -f Frontend/k8s/deployment.yaml
                else
                  kubectl set image deployment/books-frontend books-frontend=$ECR_FRONTEND:latest -n $K8S_NAMESPACE
                fi

                # Always apply frontend service (creates or updates)
                kubectl apply -f Frontend/k8s/service.yaml
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
