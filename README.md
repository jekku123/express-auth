# Expense Tracker Backend

This is the backend for the expense tracker app. It is built using Node.js, Express.js, and MongoDB.

## Structure

The backend is build using MSC (Model, Service, Controller) architecture. The `models` folder contains the schema for the MongoDB collections. The `services` folder contains the business logic for the application. The `controllers` folder contains the route handlers.

## Features

- MSC (Model, Service, Controller) architecture
- Inversify for dependency injection
- Authentication using JWT and HTTP-only cookies with Refresh Token
- CRUD operations for transactions
- Error handling middleware
- Logger service for errors and logs using Winston
- MongoDB with Mongoose
- Security using Helmet and CORS
