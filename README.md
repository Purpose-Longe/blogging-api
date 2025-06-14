# Blogging API

A REST API for a blogging platform built with Node.js, Express, and MongoDB.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables**
   Create a `.env` file:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/blogging-api
   JWT_SECRET=your-secret-key
   NODE_ENV=development
   ```

3. **Start the server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register user
- `POST /api/auth/signin` - Login user

### Blogs
- `GET /api/blogs` - Get all published blogs (public)
- `GET /api/blogs/:id` - Get single blog (public)
- `POST /api/blogs` - Create blog (auth required)
- `PUT /api/blogs/:id` - Update blog (owner only)
- `DELETE /api/blogs/:id` - Delete blog (owner only)

### User
- `GET /api/users/blogs` - Get user's blogs (auth required)

## Features

- User authentication with JWT (1-hour expiry)
- Blog states: draft/published
- Pagination, search, and filtering
- Reading time calculation
- Read count tracking
- Owner-only blog modifications

## Authentication

Include JWT token in requests:
```
Authorization: Bearer <token>
```

## Models

**User:** first_name, last_name, email, password

**Blog:** title, description, body, author, state, read_count, reading_time, tags