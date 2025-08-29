import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongoDb.js';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 8000;
connectDB();

app.use(express.json());
app.use(cookieParser());    

app.use(cors({
      origin:'https://complete-authentication-and-authori.vercel.app/',
      credentials: true,   
}));

// API endpoints
app.get('/', (req, res) => {
  res.send('Server is running.....');
}); 

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 