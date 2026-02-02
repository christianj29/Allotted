# Allotted MDM - Angular + Flask + MySQL

This repository is a starter for your MDM web application based on your wireframes.

## Stack
- Frontend: Angular (standalone components)
- Backend: Flask + Flask-SQLAlchemy
- Database: MySQL 8
- Local orchestration: Docker Compose

## Project layout
- `frontend/` Angular app with pages for Login, Dashboard, Users, Devices, Computers, and Account
- `backend/` Flask REST API and data model
- `database/` SQL schema and seed references

## Run backend + MySQL with Docker
```bash
docker compose up --build
```

API will be available at `http://localhost:5000/api`.

## Run frontend
In a second terminal:
```bash
cd frontend
npm install
npm start
```

Angular app will be available at `http://localhost:4200`.

## Key API routes
- `POST /api/auth/login`
- `GET /api/dashboard/summary`
- `GET /api/users`
- `GET /api/users/<id>`
- `GET /api/devices`
- `GET /api/devices/<id>`
- `GET /api/computers`
- `GET /api/computers/<id>`

## Notes
- This is an MVP scaffold with sample seed data.
- Authentication uses session-friendly token output (replace with full JWT/refresh flow for production).
- You can add migrations next with Flask-Migrate/Alembic.

## GitHub CI/CD
This repo now includes GitHub Actions workflows:

- `CI` (`.github/workflows/ci.yml`)
  - Runs on PRs and pushes to `main`
  - Builds the Angular frontend
  - Runs backend Python syntax checks and a Flask app boot smoke test against a MySQL service

- `Deploy Frontend (GitHub Pages)` (`.github/workflows/deploy-frontend-pages.yml`)
  - Runs on pushes to `main` when frontend files change, and on manual dispatch
  - Builds and deploys `frontend/dist/allotted-mdm-frontend/browser` to GitHub Pages

- `Publish Backend Image (GHCR)` (`.github/workflows/publish-backend-image.yml`)
  - Runs on pushes to `main` when backend files change, and on manual dispatch
  - Builds and publishes the backend Docker image to GitHub Container Registry (`ghcr.io/<owner>/allotted-backend`)
