# 📌 Department Website Backend (Node.js + MongoDB)

This is the backend API for the **Department Website** project, built using **Node.js, Express, and MongoDB (Mongoose)**.  
It provides REST API endpoints for department data like theses, publications, etc.

---

## 🚀 Features
- Node.js + Express backend  
- MongoDB database connection (via Mongoose)  
- Modular project structure (routes, controllers, models, config)  
- Middleware support (CORS, logging with Morgan, etc.)  
- Environment variables managed with `.env`  

---

## 📂 Project Structure

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repo
```bash
git clone https://github.com/Itzklp/cp-department-website.git
cd cp-department-website

### 2️⃣ Install dependencies
```bash
npm install

### 3️⃣ Configure environment variables
```bash
Open .env and set your values like 
PORT=8080
MONGO_URI=your-mongodb-uri-here

### 4️⃣ Run the project
```bash
npm run server
