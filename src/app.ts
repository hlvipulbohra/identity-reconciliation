import express from "express";
import {json} from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health.routes';
import contactRoutes from './routes/contact.routes';

const app = express();

// use json, helmet, and rate limiting middleware
app.use(json()); 
app.use(helmet());
app.use(rateLimit({ windowMs: 1 * 60 * 1000, max: 1000 }));

// import health routes
app.use('/health', healthRoutes);
// import contact routes
app.use('/', contactRoutes);

// error handling middleware
app.use(errorHandler); 

export default app;