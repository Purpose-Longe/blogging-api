const request = require('supertest');
const { app } = require('../server');
require('./setup');

describe('Auth Endpoints', () => {
  const userData = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    password: 'password123'
  };

  describe('POST /api/auth/signup', () => {
    test('should create a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    test('should not create user with existing email', async () => {
      await request(app).post('/api/auth/signup').send(userData);
      
      const response = await request(app)
        .post('/api/auth/signup')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('User already exists');
    });

    test('should not create user with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('All fields are required');
    });
  });

  describe('POST /api/auth/signin', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(userData);
    });

    test('should sign in user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: userData.email,
          password: userData.password
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });

    test('should not sign in with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should not sign in with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({ email: userData.email });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email and password are required');
    });
  });
});