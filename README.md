# TerraPrice — Multi-Cloud Infrastructure Cost Estimator

Drop your Terraform file and instantly compare what your infrastructure costs on AWS, Azure, and GCP — with AI-powered money-saving tips.

## Features
- Drag and drop .tf file upload
- Natural language to Terraform (AI)
- Side-by-side AWS vs Azure vs GCP cost comparison
- Architecture smell detector — finds expensive patterns
- Spot instance survival score
- 12-month cost forecast
- Disaster recovery cost mode
- GitHub PR cost diff comments

## Tech Stack
- Frontend: React + Vite + Recharts
- Backend: Python FastAPI
- Database: PostgreSQL (AWS RDS)
- Cache: Redis (AWS ElastiCache)
- Deploy: AWS EKS (Kubernetes)
- CI/CD: GitHub Actions
- Monitoring: Grafana + CloudWatch

## Run locally

### 1. Clone the repo
```bash
git clone https://github.com/your-username/terraprice.git
cd terraprice
```

### 2. Set environment variables
```bash
cp .env.example .env
# Edit .env and add your API keys
```

### 3. Start with Docker Compose
```bash
docker-compose up --build
```

### 4. Open in browser
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Deploy to AWS

### 1. Initialize Terraform
```bash
cd terraform
terraform init
terraform apply -var="db_password=yourpassword"
```

### 2. Push Docker images to ECR
```bash
aws ecr get-login-password | docker login --username AWS --password-stdin <ECR_URL>
docker build -t terraprice-backend ./backend
docker tag terraprice-backend:latest <ECR_URL>/terraprice-backend:latest
docker push <ECR_URL>/terraprice-backend:latest
```

### 3. Deploy to EKS
```bash
aws eks update-kubeconfig --name terraprice-eks-cluster --region us-east-1
kubectl apply -f k8s/
```

## Project Structure
```
terraprice/
├── frontend/        # React app
├── backend/         # Python FastAPI
├── k8s/             # Kubernetes configs
├── terraform/       # AWS infrastructure
├── monitoring/      # Grafana + Prometheus
├── .github/         # CI/CD workflows
└── docker-compose.yml
```
