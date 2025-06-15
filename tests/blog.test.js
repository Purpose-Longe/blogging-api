const request = require('supertest');
const app = require('../app');
const { connect, closeDatabase, clearDatabase } = require('./setup');

describe('Blog Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  // Helper function to create a user and get auth token
  const createUserAndGetToken = async () => {
    const userData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    // Create user
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send(userData);

    // Sign in to get token
    const signinResponse = await request(app)
      .post('/api/auth/signin')
      .send({
        email: userData.email,
        password: userData.password
      });

    return {
      token: signinResponse.body.token,
      user: signupResponse.body.user || signupResponse.body
    };
  };

  describe('POST /api/blogs', () => {
    it('should create a new blog for authenticated user', async () => {
      const { token } = await createUserAndGetToken();

      const blogData = {
        title: 'Test Blog',
        description: 'A test blog post',
        body: 'This is the body of the test blog post',
        tags: ['test', 'blog']
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogData);

      expect(response.status).toBe(201);
      
      // Handle different possible response structures
      const blog = response.body.blog || response.body;
      expect(blog.title).toBe(blogData.title);
      expect(blog.state).toBe('draft'); // Default state
    });

    it('should not create blog without authentication', async () => {
      const blogData = {
        title: 'Test Blog',
        description: 'A test blog post',
        body: 'This is the body of the test blog post'
      };

      const response = await request(app)
        .post('/api/blogs')
        .send(blogData);

      expect(response.status).toBe(401);
    });

    it('should not create blog without required fields', async () => {
      const { token } = await createUserAndGetToken();

      const blogData = {
        title: 'Test Blog'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogData);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/blogs', () => {
    it('should get all published blogs', async () => {
      const response = await request(app)
        .get('/api/blogs');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.blogs || response.body)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/blogs?page=1&limit=5');

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/blogs/:id', () => {
    it('should return 404 for non-existent blog', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format

      const response = await request(app)
        .get(`/api/blogs/${fakeId}`);

      expect(response.status).toBe(404);
    });
  });
});