const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

const MONGO_URI = 'mongodb://localhost:27017/taskmanager_test_tasks';

let token;

beforeAll(async () => {
  await mongoose.connect(MONGO_URI);
  const res = await request(app).post('/api/auth/register').send({
    name: 'Task Tester',
    email: 'tasks@example.com',
    password: 'password123',
  });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('Tasks Endpoints', () => {
  let taskId;

  describe('POST /api/tasks', () => {
    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Buy groceries', priority: 'high' });
      expect(res.statusCode).toBe(201);
      expect(res.body.task.title).toBe('Buy groceries');
      taskId = res.body.task._id;
    });

    it('should return 401 without token', async () => {
      const res = await request(app).post('/api/tasks').send({ title: 'No auth' });
      expect(res.statusCode).toBe(401);
    });

    it('should return 400 without title', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return tasks for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.tasks.length).toBeGreaterThan(0);
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a single task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.task._id).toBe(taskId);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });
      expect(res.statusCode).toBe(200);
      expect(res.body.task.status).toBe('completed');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
    });

    it('should return 404 for a deleted task', async () => {
      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(404);
    });
  });
});
