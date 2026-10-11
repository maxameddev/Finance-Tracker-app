# Finance Tracker

A full-stack personal finance tracking application for managing income, expenses, and financial reports — built with a Node.js/Express REST API and a React frontend.

## Features

- Authentication — Secure signup/login with JWT-based auth
- Transaction Management — Add, edit, delete, and categorize income/expenses
- Dashboard — At-a-glance summary of total balance, income, and expenses
- Reports & Charts — Visual breakdown of spending by category and trends over time
- Receipt Uploads — Attach receipt images to transactions (via Cloudinary)
- Dark Mode — Full light/dark theme support
- Profile Management — User account settings

## Tech Stack

Backend: Node.js, Express, MongoDB, Mongoose, JWT authentication, Cloudinary for file uploads, Express Validator for request validation, Helmet/CORS/Rate Limiting for security, Swagger for API docs.

Frontend: React with Vite, shadcn/ui, Tailwind CSS, React Router, Recharts for data visualization.

## Project Structure

Fullstack Project contains two main folders. Finance-Tracker-API is the backend Express API, with config for database and Cloudinary setup, controller for route handlers, middleware for auth/upload/validation, models for Mongoose schemas, routes for API routes, validators for request validation rules, and index.js as the entry point. Frontend is the React app, with components including shadcn UI components, hooks for custom React hooks, lib for the API client and utilities, and pages for the app screens including Dashboard, Transactions, Reports, and Profile.

## Getting Started

Clone the repository with git clone https://github.com/maxameddev/Finance-Tracker-app.git, then cd into Finance-Tracker-app.

For the backend: cd Finance-Tracker-API, run npm install, copy .env.example to .env, fill in the required values, then run npm start. The API will run on http://localhost:3000.

For the frontend: cd Frontend, run npm install, create a .env file with VITE_API_URL=http://localhost:3000, then run npm run dev. The app will be available at http://localhost:5173.

## Environment Variables

Backend .env requires: PORT for the port the API runs on, NODE_ENV for development or production, MONGO_URI for the MongoDB connection string, JWT_SECRET for signing JWTs, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET for Cloudinary file uploads, and CORS_ORIGIN for the allowed frontend origin such as http://localhost:5173.

Frontend .env requires: VITE_API_URL for the base URL of the backend API.

## API Overview

Auth endpoints: POST /api/auth/register to register a new user (no auth required), POST /api/auth/login to log in and receive a JWT (no auth required).

Transaction endpoints (all require auth): GET /api/transactions to list transactions, POST /api/transactions to create a transaction, PUT /api/transactions/:id to update a transaction, DELETE /api/transactions/:id to delete a transaction.

Category endpoints: GET /api/categories to list categories (requires auth).

Full API documentation is available via Swagger at /api-docs once the server is running.

## License

This project is for personal and educational use.