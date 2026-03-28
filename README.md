# BlogStack

A professional-grade **MERN** application for managing blog lists, featuring secure authentication, role-based permissions, and automated CI/CD.

![Build Status](https://github.com/miko-keng/blogstack-fullstack/actions/workflows/pipeline.yml/badge.svg)
## 🚀 Live Demo
[View Live on Render](https://blogstack-fullstack.onrender.com/)

---

## 🛠 Tech Stack

**Frontend & UI**
- React (Vite)
- Tailwind CSS

**Backend & Infrastructure**
- Node.js & Express
- MongoDB (Mongoose)
- **Docker** (Containerization)
- **GitHub Actions** (CI/CD)

**Security & Quality**
- JWT (JSON Web Tokens)
- ESLint v9 (Static Analysis)
- Supertest (Integration Testing)

---

## 🐳 Docker Support
This project is fully containerized to ensure environment parity across development and production.

**Build and run locally:**
```bash
# From the bloglist-backend directory
docker build -t blogstack-backend .
docker run -p 3003:3003 --env-file .env blogstack-backend
```
---

## 👥 Demo Accounts

### Normal User
- **Username:** `alice_dev`
- **Name:** Alice Tan
- **Password:** `password123`

### Admin User
- **Username:** `admin_jessie`
- **Name:** Jessie Admin
- **Password:** `adminpassword123`
- **Role:** admin
