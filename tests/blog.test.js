const request = require('supertest');
const { app } = require('../server');
require('./setup');

describe('Blog Endpoints', () => {
  let userToken;
  let userId;
  let blogId;
  let otherUserToken;

  const userData = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'password123'
  };

  const otherUserData = {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    password: 'password123'
  };

  const blogData = {
    title: 'Test Blog',
    description: 'A test blog description',
    body: 'This is the body of the test blog with enough content to calculate reading time.',
    tags: ['test', 'blog']
  };

  beforeEach(async () => {
    // Create and sign in users
    const userResponse = await request(app)
      .post('/api/auth/signup')
      .send(userData);
    userToken = userResponse.body.token;
    userId = userResponse.body.user._id;

    const otherUserResponse = await request(app)
      .post('/api/auth/signup')
      .send(otherUserData);
    otherUserToken = otherUserResponse.body.token;
  });

  describe('POST /api/blogs', () => {
    test('should create a new blog for authenticated user', async () => {
      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send(blogData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Blog created successfully');
      expect(response.body.blog.title).toBe(blogData.title);
      expect(response.body.blog.state).toBe('draft');
      expect(response.body.blog.reading_time).toBeGreaterThan(0);
      expect(response.body.blog.read_count).toBe(0);

      blogId = response.body.blog._id;
    });

    test('should not create blog without authentication', async () => {
      const response = await request(app)
        .post('/api/blogs')
        .send(blogData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access denied. No token provided.');
    });

    test('should not create blog without required fields', async () => {
      const response = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ description: 'Only description' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Title and body are required');
    });
  });

  describe('GET /api/blogs', () => {
    beforeEach(async () => {
      // Create a published blog
      const blogResponse = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send(blogData);
      
      blogId = blogResponse.body.blog._id;

      // Publish the blog
      await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ state: 'published' });
    });

    test('should get all published blogs', async () => {
      const response = await request(app).get('/api/blogs');

      expect(response.status).toBe(200);
      expect(response.body.blogs).toHaveLength(1);
      expect(response.body.blogs[0].state).toBe('published');
      expect(response.body.pagination).toBeDefined();
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });

    test('should support search by title', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .query({ title: 'Test' });

      expect(response.status).toBe(200);
      expect(response.body.blogs).toHaveLength(1);
    });

    test('should support ordering', async () => {
      const response = await request(app)
        .get('/api/blogs')
        .query({ order_by: 'createdAt', order: 'desc' });

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/blogs/:id', () => {
    beforeEach(async () => {
      const blogResponse = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send(blogData);
      
      blogId = blogResponse.body.blog._id;

      await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ state: 'published' });
    });

    test('should get a published blog by id', async () => {
      const response = await request(app).get(`/api/blogs/${blogId}`);

      expect(response.status).toBe(200);
      expect(response.body.blog._id).toBe(blogId);
      expect(response.body.blog.author).toBeDefined();
    });

    test('should increment read count', async () => {
      const firstResponse = await request(app).get(`/api/blogs/${blogId}`);
      const initialReadCount = firstResponse.body.blog.read_count;

      const secondResponse = await request(app).get(`/api/blogs/${blogId}`);
      expect(secondResponse.body.blog.read_count).toBe(initialReadCount + 1);
    });

    test('should return 404 for non-existent blog', async () => {
      const response = await request(app).get('/api/blogs/507f1f77bcf86cd799439011');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Blog not found');
    });
  });

  describe('PUT /api/blogs/:id', () => {
    beforeEach(async () => {
      const blogResponse = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send(blogData);
      
      blogId = blogResponse.body.blog._id;
    });

    test('should update own blog', async () => {
      const updateData = {
        title: 'Updated Test Blog',
        state: 'published'
      };

      const response = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.blog.title).toBe(updateData.title);
      expect(response.body.blog.state).toBe('published');
    });

    test('should not update other user\'s blog', async () => {
      const response = await request(app)
        .put(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Hacked Blog' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied. You are not the owner of this blog.');
    });

    test('should not update without authentication', async () => {
      const response = await request(app)
        .put(`/api/blogs/${blogId}`)
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/blogs/:id', () => {
    beforeEach(async () => {
      const blogResponse = await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send(blogData);
      
      blogId = blogResponse.body.blog._id;
    });

    test('should delete own blog', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Blog deleted successfully');
    });

    test('should not delete other user\'s blog', async () => {
      const response = await request(app)
        .delete(`/api/blogs/${blogId}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/users/blogs', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send(blogData);

      await request(app)
        .post('/api/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...blogData, title: 'Second Blog', state: 'published' });
    });

    test('should get user\'s own blogs', async () => {
      const response = await request(app)
        .get('/api/users/blogs')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.blogs).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    test('should filter by state', async () => {
      const response = await request(app)
        .get('/api/users/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ state: 'draft' });

      expect(response.status).toBe(200);
      expect(response.body.blogs.every(blog => blog.state === 'draft')).toBe(true);
    });

    test('should not access without authentication', async () => {
      const response = await request(app).get('/api/users/blogs');

      expect(response.status).toBe(401);
    });
  });
});