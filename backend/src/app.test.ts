import request from 'supertest';
import app from './app';

/*------------- Express Integration Tests -------------*/

describe('GET /health', () => {
  it('should return 200 OK and status ok', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: 'ok',
      timestamp: expect.any(String),
    });
  });

  it('should return 404 for unknown endpoints', async () => {
    const response = await request(app).get('/unknown-endpoint');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Not Found' });
  });
});
