# Blogging API

A RESTful API for a blogging platform built with Node.js, Express, and MongoDB.

## Features

- User authentication (signup/signin)
- Blog CRUD operations
- Pagination and search functionality
- Reading time calculation
- State management (draft/published)
- User-specific blog access

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Sign in user

### Blogs
- `GET /api/blogs` - Get all published blogs (supports pagination, search, ordering)
- `GET /api/blogs/:id` - Get single blog by ID
- `POST /api/blogs` - Create new blog (authenticated)
- `PUT /api/blogs/:id` - Update blog (authenticated, owner only)
- `DELETE /api/blogs/:id` - Delete blog (authenticated, owner only)

### User Blogs
- `GET /api/users/blogs` - Get user's own blogs (authenticated)

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT
- **Testing:** Jest, Supertest
- **Deployment:** Render

## Installation

1. Clone the repository
```bash
git clone https://github.com/Purpose-Longe/blogging-api
cd blogging-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file
MONGODB_URI=my_mongodb_connection_string
JWT_SECRET=my_jwt_secret
PORT=3000
```

4. Run the application
```bash
npm start
```

## Testing

Run all tests:
```bash
npm test
```

## Live Demo

The API is deployed at: https://blogging-api-vlga.onrender.com

## Test Coverage

- Authentication endpoints (signup, signin)
- Blog CRUD operations
- Pagination and filtering
- User authorization
- Error handling

All tests passing: 12/12