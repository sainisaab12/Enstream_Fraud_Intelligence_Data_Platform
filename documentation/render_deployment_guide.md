# Render Deployment Guide - EnStream Fraud Intelligence Platform

This guide walks you through the step-by-step process of deploying the **EnStream Fraud Intelligence Platform** on the **Render** cloud platform.

Because we have already configured a Render Blueprint file ([render.yaml](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/render.yaml)), the deployment process is automated. Render will spin up both the **FastAPI Python backend** and the **Vite + React static frontend** as a single stack, automatically linking them.

---

## Prerequisites

1. A **GitHub** account (or GitLab/Bitbucket).
2. A **Render** account (you can sign up for free at [render.com](https://render.com)).
3. Git installed locally on your system.

---

## Step 1: Initialize Git & Commit Your Code

First, verify that your workspace is clean. We have already created a root `.gitignore` file that excludes unnecessary folders (such as `node_modules/`, `dist/`, python cache files, and the local SQLite database file).

Open your terminal (PowerShell, Command Prompt, or bash) in the project root directory and run the following commands:

```bash
# 1. Initialize git repository
git init

# 2. Add all files (the .gitignore will protect databases/dependency directories)
git add .

# 3. Create your initial commit
git commit -m "feat: configure EnStream platform for Render blueprint deployment"
```

---

## Step 2: Push Your Code to GitHub

Create a new repository on your GitHub account.

1. Go to [github.com/new](https://github.com/new).
2. Name your repository (e.g., `enstream-fraud-intelligence`).
3. Leave it public or private (either is fine; Render supports private repos).
4. Do **not** initialize it with a README, `.gitignore`, or license (since these are already in your project).
5. Copy the remote repository URL, then run the following in your terminal:

```bash
# 1. Rename your default branch to main
git branch -M main

# 2. Add the remote GitHub repository
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# 3. Push your code
git push -u origin main
```

---

## Step 3: Deploy to Render using Blueprints

Render Blueprints allow you to deploy a multi-service stack defined by a `render.yaml` file. Render will automatically read our config and set up the FastAPI backend and Vite frontend static site.

1. Log in to the [Render Dashboard](https://dashboard.render.com).
2. Click the **New** button in the top-right corner.
3. Select **Blueprint** from the dropdown menu.
4. If you haven't connected your GitHub account to Render yet, connect it under **GitHub**.
5. Find and select your newly created repository (`enstream-fraud-intelligence`).
6. Name your Blueprint Group (e.g., `enstream-prod`). This is used to prefix resource names.
7. Render will show the list of services it detected from `render.yaml`:
   - `enstream-backend` (Web Service, Python environment)
   - `enstream-frontend` (Static Site, Node environment)
8. Under **Environment Variables**, you will see variables defined in `render.yaml`:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `REDSHIFT_CONN_STR`
   
   > [!NOTE]
   > **Offline Mode / Local Simulation**: If you want to run the platform in local simulation mode (using the built-in SQLite file and in-memory mock tables), you can leave these values empty or type dummy values. The backend is built to fall back gracefully.
   
9. Click **Apply** (or **Approve**) to start the build and deployment process.

---

## Under the Hood: How the Deployment Works

Our configuration simplifies hosting by handling the following details:

### 1. Unified Environment variables
The frontend static site is automatically configured to point to the backend service. In `render.yaml`, the frontend service uses a `fromService` directive to get the backend URL:

```yaml
    envVars:
      - key: VITE_BACKEND_URL
        fromService:
          type: web
          name: enstream-backend
          property: url
```

Render injects the backend's live URL (e.g., `https://enstream-backend.onrender.com`) into the frontend's environment variables as `VITE_BACKEND_URL`.

### 2. Auto-Resolving API Endpoints
In the frontend code, [config.ts](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/frontend/src/config.ts) is set up to automatically resolve URLs:
- First, it checks `import.meta.env.VITE_BACKEND_URL` for the Render-provided URL.
- Second, if not set, it checks the browser's current hostname. If it matches `enstream-frontend.onrender.com`, it automatically points backend requests to `enstream-backend.onrender.com`.
- Otherwise, it falls back to `http://localhost:8000` for seamless local development.

### 3. Dynamic Port Binding
On Render, web services bind to the `$PORT` environment variable assigned by the hosting server. Our [run.py](file:///c:/Users/anil.saini/.gemini/antigravity/brain/e32c355e-c953-4199-9e0a-e3ba2ce52abf/Enstream/backend/run.py) script reads this dynamically:
```python
port = int(os.environ.get("PORT", 8000))
uvicorn.run('app.main:app', host='0.0.0.0', port=port, reload=False)
```

### 4. SPA Fallback Routing
Since our frontend is a single-page app (SPA), direct browser navigation to subpaths (e.g., `/investigator` or `/data-quality`) would normally result in a 404. We added a rewrite rule in `render.yaml` to route all page requests to `/index.html`:

```yaml
    routes:
      - type: rewrite
        src: /*
        dest: /index.html
```

---

## Verifying Deployment Success

Once Render indicates that both services are **Live**:

1. Click on the URL of your static site (e.g., `https://enstream-frontend.onrender.com`).
2. Open your browser developer tools (**F12** or **Ctrl+Shift+I**) and navigate to the **Network** tab.
3. Reload the page and verify that backend API calls to `/api/entity/...` or `/api/data/gold` are resolving successfully to the backend URL without CORS errors.
