---
description: How to deploy the backend to GCP Cloud Run and frontend to Vercel
---

# Cloud Deployment Guide

This guide outlines the steps to deploy the **backend** to Google Cloud Platform (Cloud Run) and the **frontend** to Vercel.

## Prerequisites

- **Google Cloud Platform (GCP)** Account
- **Vercel** Account
- **Google Cloud CLI** (`gcloud`) installed and authenticated
- **Vercel CLI** (`vercel`) installed (optional, can also use Git integration)

## Part 1: Deploy Backend to Google Cloud Run

We will containerize the backend and deploy it as a serverless service on Cloud Run.

### 1. Setup GCP Project

Ensure you have a GCP project selected and billing enabled.

```bash
export PROJECT_ID=your-project-id
gcloud config set project $PROJECT_ID
```

### 2. Enable Services

Enable the necessary APIs:

```bash
gcloud services enable artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com
```

### 3. Create Artifact Registry

Create a repository to store your Docker images.

```bash
gcloud artifacts repositories create medical-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker repository for Medical Diagnosis App"
```

### 4. Build and Submit Image

Use Cloud Build to build the image and push it to the registry. This avoids needing to configure local Docker authentication for GCP.

Run this from the root of the project:

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/$PROJECT_ID/medical-repo/backend . -f app/backend/Dockerfile
```

*Note: This uses the `app/backend/Dockerfile` we created earlier.*

### 5. Deploy to Cloud Run

Deploy the container to Cloud Run.

```bash
gcloud run deploy medical-backend \
    --image us-central1-docker.pkg.dev/$PROJECT_ID/medical-repo/backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 2Gi
```

*Note: We allocate 2Gi of memory because the ML models (Sentence Transformers, FAISS) can be memory intensive.*

### 6. Get Backend URL

After deployment, note the Service URL (e.g., `https://medical-backend-xyz-uc.a.run.app`). You will need this for the frontend.

## Part 2: Deploy Frontend to Vercel

We will deploy the React frontend to Vercel and connect it to the backend.

### Option A: Using Vercel CLI

1.  **Login**:
    ```bash
    vercel login
    ```

2.  **Deploy**:
    Run the following command from the root (or `app/frontend` if you prefer, but root is fine if configured):

    ```bash
    cd app/frontend
    vercel
    ```

3.  **Configure Project**:
    - Follow the prompts.
    - **Link to existing project?** [N]
    - **Link to existing project?** [N]
    - **In which directory is your code located?** ./
    - **Want to modify these settings?** [y]
    - **Build Command**: `npm run build`
    - **Output Directory**: `dist`
    - **Install Command**: `npm install`

4.  **Set Environment Variable**:
    When asked about Environment Variables, add:
    - **Name**: `VITE_API_URL`
    - **Value**: `YOUR_BACKEND_URL` (from Part 1, e.g., `https://medical-backend-xyz-uc.a.run.app`)
    - *Important: Do not add a trailing slash.*

### Option B: Using Vercel Dashboard (Git Integration)

1.  Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2.  Import the project in Vercel.
3.  Select the `app/frontend` directory as the Root Directory.
4.  In **Environment Variables**, add:
    - `VITE_API_URL`: `YOUR_BACKEND_URL`
5.  Click **Deploy**.

## Verification

1.  Open the Vercel deployment URL.
2.  Enter a symptom description.
3.  Verify that the app successfully retrieves predictions from the backend.
