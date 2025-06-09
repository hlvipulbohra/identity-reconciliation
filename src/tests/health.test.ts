import request from 'supertest';
import app from '../app';


describe ('Health check API',()=>{
  it("should return 200 OK for health check endpoint", async () => {
    
    const response = await request(app).get('/health');
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "OK");
    expect(response.body).toHaveProperty("uptime");
    expect(typeof response.body.uptime).toBe("number");
  })
 
})