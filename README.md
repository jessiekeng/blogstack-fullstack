# BlogStack

A full-stack **MERN** application for managing blog lists, featuring secure authentication and role-based permissions.

## 🚀 Live Demo
> _(Add your live demo link here when ready)_

---

## 🛠 Tech Stack

**Frontend**
- React (Vite)
- Axios

**Backend**
- Node.js
- Express
- MongoDB (Mongoose)

**Authentication**
- JWT (JSON Web Tokens)

**Deployment**
- Render (with CI/CD)

---

## ✨ Core Features

- **RESTful API**  
  Clean and scalable backend architecture for managing blog resources.

- **Secure Authentication**  
  JWT-based login with persistent sessions.

- **Role-Based Access Control (RBAC)**  
  Custom middleware to restrict CRUD operations based on user roles.

- **Automated Deployment**  
  CI/CD pipeline on Render for seamless production updates.

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/jessiekeng/part4_bloglist_backend.git
cd part4_bloglist_backend
```

### 2. Install Dependencies
Run the following command to install all required packages:
```bash
npm install
```

### 3. Environment Setup
Create a .env file in the root directory and add your environment variables:
MONGODB_URI=your_mongodb_connection_string
SECRET=your_jwt_secret

### 4. Run the Application
Start the development server with:
```bash
npm run dev
```

