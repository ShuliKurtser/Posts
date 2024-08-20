
//npm run dev


import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'
import fileUpload from 'express-fileupload'

import authRoute from './routes/auth.js'
import postRoute from './routes/posts.js'
import commentRoute from './routes/comments.js'
dotenv.config();

const app = express();


// Constants
const PORT = process.env.PORT || 3001
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME

// Middleware
app.use(cors())

app.use(express.json())
 app.use(express.static('uploads'))
app.use(fileUpload())


// Routes

// http://localhost:3002
app.use('/api/auth', authRoute)
app.use('/api/posts', postRoute)
app.use('/api/comments', commentRoute)

const start = async () => {
    try {
        const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.ppe3h6b.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
                
        await mongoose.connect(uri);

        console.log('Connected to MongoDB');
        app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
};

start();
