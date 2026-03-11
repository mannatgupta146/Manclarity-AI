import express from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Manclarity AI API');
});

export default app;