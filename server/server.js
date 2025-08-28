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

const allowedOrigins = [
  'https://complete-authentication-and-authori.vercel.app/'
];

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server requests
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true // important to allow cookies
}));

// Handle preflight requests
app.options('*', cors({ origin: allowedOrigins, credentials: true }));

// Routes
app.get('/', (req, res) => res.send('Server is running...'));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
