const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/ErrorHandler');

// Routes
const authRoutes     = require('./src/routes/AuthRoute');
const userRoutes     = require('./src/routes/UserRoute');
const subjectRoutes  = require('./src/routes/SubjectRoute');
const topicRoutes    = require('./src/routes/TopicRoute');
const questionRoutes = require('./src/routes/QuestionRoute');
const quizRoutes     = require('./src/routes/QuizRoute');
const resultRoutes   = require('./src/routes/ResultRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/auth',      authRoutes);
app.use('/api/users',     userRoutes);
app.use('/api/subjects',  subjectRoutes);
app.use('/api/topics',    topicRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/quizzes',   quizRoutes);
app.use('/api/results',   resultRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'Quiz API running' }));

// Central error handler — must be last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});