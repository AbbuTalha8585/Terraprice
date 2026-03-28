---
description: How to build, push, and refresh the TerraPrice application on AWS EKS
---

# Production Deployment Workflow

Follow these steps whenever you make changes to the code and want to see them live on your AWS EKS cluster.

## 1. Build and Push Backend
Run these commands to update the pricing engine logic:

// turbo
```powershell
docker build -t terraprice-backend backend/
docker tag terraprice-backend:latest 486036153335.dkr.ecr.us-east-1.amazonaws.com/terraprice-backend:latest
docker push 486036153335.dkr.ecr.us-east-1.amazonaws.com/terraprice-backend:latest
```

## 2. Build and Push Frontend
Run these commands to update the UI and styling:

// turbo
```powershell
docker build -t terraprice-frontend frontend/
docker tag terraprice-frontend:latest 486036153335.dkr.ecr.us-east-1.amazonaws.com/terraprice-frontend:latest
docker push 486036153335.dkr.ecr.us-east-1.amazonaws.com/terraprice-frontend:latest
```

## 3. Refresh EKS Pods
After pushing the images, you MUST tell EKS to pull the new versions and restart the pods:

// turbo
```powershell
kubectl rollout restart deployment terraprice-backend terraprice-frontend
```

## 4. Verify the Rollout
Check the status to ensure all pods are running successfully:

```powershell
kubectl get pods -w
```
