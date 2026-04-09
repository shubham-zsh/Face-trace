import express from 'express'
import {PORT,MONGODB_KEY,HF_TOKEN} from './config.js'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.routes.js'
import userRouter from './routes/user.route.js'
import sketchRouter from './routes/sketch.routes.js'
import faceRouter from './routes/face.routes.js'
import errorMiddleware from './middleware/error.middleware.js'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:6001',
    'http://127.0.0.1:6001',
];
const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser clients (no Origin header) and allowed frontend origins.
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(express.json())

app.use(express.urlencoded({extended:false}))
app.use(cookieParser())

app.use('/database_faces', express.static(path.join(__dirname, 'database_faces')));

app.use('/api/v1/auth',authRouter);
app.use('/api/v1/user',userRouter);
app.use('/api/v1/sketch',sketchRouter);
app.use('/api/v1/face',faceRouter);
app.use(errorMiddleware);

app.get('/',(req,res)=>{
    console.log(req);
    res.status(202).send("this is home page")
})

mongoose
.connect(MONGODB_KEY)
.then(()=>{
    console.log('database is connected');
    app.listen(PORT,()=>{
    console.log("server is running at 5555")
})}).catch((error)=>{
    console.log(error)})
