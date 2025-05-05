# MERN Stack Inventory Management System

## Demo
https://youtu.be/7BPNwyeDvSY

## Installation
To run this project locally, follow these steps:

1. **After Unzip**
   Open project in Terminal / CMD

2. **Install dependencies for both frontend and backend:**

   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd frontend
   npm install

3. **Set up environment variables:**
   Edit `.env` file in the `backend` directory :

   PORT=[Your Port]
   MONGO_DB_URI=[Connection URL]
   JWT_SECRET=[Your Secret Key]


4. **Run the application:**
   
   # Start the backend server
   cd backend
   npm start

   # Start the frontend server
   cd frontend
   npm start


**Additional Notes**

   - Ensure you have Node.js and npm installed on your system before starting.
   - Both the frontend and server must be running simultaneously for the app to work fully.
   - For MongoDB you shaould have MondoDB Compass installed or setup connection online wiht  Monogodb Atlas. If you don't know how to setup I have videos in my channel you can watch. "Code With Yousaf"