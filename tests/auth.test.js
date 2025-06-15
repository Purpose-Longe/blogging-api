const request = require('supertest');
const app = require('../app'); // Import app, not server
const { connect, closeDatabase, clearDatabase } = require('./setup');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/auth/signup', () => {
    it('should create a new user', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.message || response.body.success).toBeTruthy();
      expect(response.body.user.email || response.body.email).toBe(userData.email);
      expect(response.body.user.password || response.body.password).toBeUndefined(); // Password should not be returned
    });

    it('should not create user with existing email', async () => {
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Create user first
      await request(app)
        .post('/api/auth/signup')
        .send(userData);

      // Try to create same user again
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.message || response.body.error).toBeTruthy();
    });

    it('should not create user with missing fields', async () => {
      const userData = {
        first_name: 'John',
        email: 'john@example.com'
        // Missing last_name and password
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.message || response.body.error).toBeTruthy();
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      // Create a user for login tests
      const userData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/signup')
        .send(userData);
    });

    it('should sign in user with valid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/signin')
        .send(loginData)
        .expect(200);

      expect(response.body.message || response.body.success).toBeTruthy();
      expect(response.body.token).toBeDefined();
    });

    it('should not sign in with invalid credentials', async () => {
      const loginData = {
        email: 'john@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/signin')
        .send(loginData)
        .expect(401);

      expect(response.body.message || response.body.error).toBeTruthy();
    });

    it('should not sign in with missing fields', async () => {
      const loginData = {
        email: 'john@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/signin')
        .send(loginData)
        .expect(400);

      expect(response.body.message || response.body.error).toBeTruthy();
    });
  });
});