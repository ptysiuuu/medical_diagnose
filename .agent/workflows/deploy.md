---
description: How to deploy the application using Docker Compose
---

# Deployment Workflow

This workflow describes how to build and run the application using Docker Compose.

## Prerequisites

- Docker
- Docker Compose

## Steps

1. **Build and Start Services**

   Run the following command to build the images and start the containers in detached mode:

   ```bash
   docker-compose up --build -d
   ```

2. **Verify Backend**

   Check if the backend is running:

   ```bash
   curl http://localhost:8000/
   ```

   You should see a JSON response with a message.

3. **Verify Frontend**

   Open your browser and navigate to:

   [http://localhost:5173](http://localhost:5173)

   You should see the Medical Diagnosis AI interface.

4. **Stop Services**

   To stop the services, run:

   ```bash
   docker-compose down
   ```
