# Express Auth

Express application to handle database session based authentication using homemade classes and middleware.
Repo also contains brances for authentication using express-session and passport.js

It follows the clean architecture pattern so that the business logic is separated from the express application.
And the database is abstracted so that it can be easily changed.

## Technologies

- Node.js
- Express.js
- Typescript
- Mongoose
- Inversify - For dependency injection
- Node-cron - For scheduling tasks
- Winston - Logger

## Pre-requisites

- Docker
- Docker-compose

## Installation

1. Clone the repository
2. Run `docker compose up -d` to start the mongodb container and `docker compose down` to stop it

### Makefile commands

`make up` to start the application
`make down` to stop the application
`make redo` to restart the application

## Usage

1. Register a user by sending a POST request to `api/user/register` with the following payload:

```json
{
  "email": "email@email.com",
  "password": "password"
}
```

2. Verify the user by sending a GET request to `api/user/verify-email` with the token received in the response from the register endpoint as params: `?token=TOKEN`

3. Login by sending a POST request to `api/auth/login` with the following payload:

```json
{
  "email": "email@email.com",
  "password": "password"
}
```

4. Logout by sending a POST request to `api/auth/logout`

5. Reset password by sending a POST request to `api/auth/forgot-password` with the following payload:

```json
{
  "email": "email@email.com"
}
```

4. Reset password by sending a GET request to `api/user/reset-password` with the token received in the response from the forgot-password endpoint as params: `?token=TOKEN`

body:

```json
{
  "password": "password"
}
```
