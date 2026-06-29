🗂️ Task Bucket

A full-stack task management platform built for EDC (Electronic Data Capture) workflows. Designed for speed, modularity, and secure collaboration.

<p align="center">
<a href="https://task-bucket.vercel.app"><strong>View Live Demo »</strong></a>
·
<a href="https://github.com/Subhadip006/task_bucket/issues">Report Bug</a>
·
<a href="https://github.com/Subhadip006/task_bucket/issues">Request Feature</a>
</p>

Table of Contents

About The Project

Key Features

Tech Stack

Project Structure

Getting Started

Prerequisites

Installation

Environment Variables

Running the Project

Available Scripts

Deployment

License

Contact

About The Project

This project is a complete task management solution with a React/Vite frontend and a Node/Express backend. It's built as a monorepo, making it scalable and easy to manage. Key features focus on security, collaboration, and performance.

🔐 Key Features

✅ Input Validation: Prevents malformed or malicious data submissions.

🛡️ Rate Limiting: Protects backend endpoints against abuse and spam.

🔒 Private/Public Tasks: Toggle task visibility for personal use or collaboration.

💬 Discussion Threads: Built-in commenting system for each task.

🌐 Multi-Domain Support: Configurable for multiple tenants (see MULTIPLE_DOMAINS_FEATURE.md).

🧰 Tech Stack

Layer

Technology

Frontend

React, Vite, Tailwind CSS

Backend

Node.js, Express

Validation

Custom logic + Middleware

Deployment

Vercel

📁 Project Structure

The repository is structured as a monorepo with separate client and backend directories.

task_bucket/
├── client/          # React frontend (Vite + Tailwind)
├── backend/         # Express backend with validation and rate limiting
├── CHANGELOG.md     # Feature history
├── LICENSE.md       # MIT License
├── MULTIPLE_DOMAINS_FEATURE.md # Notes on domain support
├── package.json     # Root config
└── .gitignore


🚀 Getting Started

Follow these steps to get a local copy up and running.

Prerequisites

You must have the following software installed on your machine:

Node.js (v18.x or later recommended)

npm (comes with Node.js)

Installation

Clone the repository:

git clone [https://github.com/Subhadip006/task_bucket.git](https://github.com/Subhadip006/task_bucket.git)
cd task_bucket


Install root dependencies:

npm install


Install client-side dependencies:

cd client
npm install


Install backend-side dependencies:

cd ../backend
npm install


Environment Variables

This project requires environment variables to connect to the database and manage security.

Backend (/backend): Create a .env file in the /backend directory and add the following (replace with your values):

# /backend/.env
PORT=5000
DATABASE_URL="your_mongodb_connection_string"
JWT_SECRET="your_strong_jwt_secret_key"


Frontend (/client): Create a .env file in the /client directory to point to your local backend:

# /client/.env
VITE_API_BASE_URL="http://localhost:5000/api"


🏃 Running the Project

You will need two separate terminals to run both the frontend and backend servers.

Start the Backend Server
(From the /backend directory)

npm run start


Your API will be running at http://localhost:5000.

Start the Frontend Server
(From the /client directory)

npm run dev


Your React app will be available at http://localhost:5173 (or as specified by Vite).

🧪 Available Scripts

Location

Command

Description

client

npm run dev

Starts the Vite dev server

client

npm run build

Builds frontend for production

backend

npm run start

Starts the Express server

🌐 Deployment

This project is configured for easy deployment on Vercel.

Push your code to a GitHub repository.

Connect the repository to your Vercel account.

Vercel will auto-detect the monorepo structure and build settings via vite.config.js.

Important: Add your environment variables (from your .env files) to the Vercel project's "Environment Variables" settings before deploying.

📄 License

Distributed under the MIT License. See LICENSE.md for more information.