import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import Subjects from './pages/admin/Subjects';
import Topics from './pages/admin/Topics';
import Questions from './pages/admin/Questions';
import Quizzes from './pages/admin/Quizzes';
import Users from './pages/admin/Users';
import AdminResults from './pages/admin/AdminResults';
import StudentDashboard from './pages/student/StudentDashboard';
import QuizAttempt from './pages/student/QuizAttempt';
import StudentResults from './pages/student/StudentResults';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/subjects" element={<ProtectedRoute role="admin"><Subjects /></ProtectedRoute>} />
          <Route path="/admin/topics" element={<ProtectedRoute role="admin"><Topics /></ProtectedRoute>} />
          <Route path="/admin/questions" element={<ProtectedRoute role="admin"><Questions /></ProtectedRoute>} />
          <Route path="/admin/quizzes" element={<ProtectedRoute role="admin"><Quizzes /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><Users /></ProtectedRoute>} />
          <Route path="/admin/results" element={<ProtectedRoute role="admin"><AdminResults /></ProtectedRoute>} />
          <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/student/quiz/:quizId" element={<ProtectedRoute role="student"><QuizAttempt /></ProtectedRoute>} />
          <Route path="/student/results" element={<ProtectedRoute role="student"><StudentResults /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
