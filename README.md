# VenQ-backend

# Description: 
VenQ Backend is a backend application that provides authentication and authorization services for the VenQ platform. It is written in Node.js and uses Express, MongoDB, and JWT.

# Requirements:

Node.js (v18 or higher)
MongoDB (v4.2 or higher)

# Installation:

# Clone the repository:
git clone https://github.com/Greninja28/VenQ-backend.git

# Install the dependencies:
npm install

# Create a .env file and populate it with your environment variables, including:
1. MONGODB_URI=
2. GMAIL_USER=
3. GMAIL_PASS=
4. ACCESS_TOKEN_SECRET=

# Start the server:
npm start

# Usage:

The VenQ Backend provides a number of endpoints for authentication and authorization. You can use these endpoints to authenticate users, verify their email addresses, and log them in and out.

To use the VenQ Backend, you will need to create a JWT token. You can do this by calling the /auth/signup endpoint. This endpoint will send you an OTP via email. You will need to provide this OTP to the /auth/verify-email endpoint to verify your email address and create a JWT token.

Once you have a JWT token, you can use it to authenticate to the VenQ Backend. To do this, you will need to pass the token in the Authorization header of your requests. The Authorization header should be formatted as follows:

Authorization: Bearer <token>

# Testing:

To test the VenQ Backend, you can use the following steps:

1. Start the server.
2. Make a POST request to the /auth/signup endpoint with your email address and password.
3. Check your email for the OTP and provide it to the /auth/verify-email endpoint.
4. Make a POST request to the /auth/login endpoint with your email address and password.
5. You should receive a JWT token in the response.
6. Make a GET request to any protected endpoint, passing the JWT token in the Authorization header.
7. You should receive a successful response.
