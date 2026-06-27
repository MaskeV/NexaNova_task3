import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';
import api from '../../api/client';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes/today')
      .then(({ data }) => setQuizzes(data.quizzes || data.data || []))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}!</h1>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link to="/student/results" className="btn-secondary text-sm gap-2">
            📊 My Results
          </Link>
        </div>

        <div className="card p-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
          <h2 className="font-semibold text-indigo-900 mb-1">Today's Quizzes</h2>
          <p className="text-indigo-600 text-sm">Quizzes scheduled for today. Attempt them before they expire.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-3">📅</div>
            <p className="font-semibold text-gray-700">No quizzes today</p>
            <p className="text-gray-400 text-sm mt-1">Check back tomorrow or view your past results</p>
            <Link to="/student/results" className="btn-secondary mt-4 text-sm inline-flex">View My Results</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {quizzes.map(quiz => (
              <div key={quiz._id} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{quiz.quizId}</span>
                    <span className="text-xs text-gray-400">{quiz.subjectId} · {quiz.topicId}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>⏱ {quiz.duration_minutes} minutes</span>
                    <span>❓ {quiz.questions?.length || 0} questions</span>
                    <span>🕙 {quiz.scheduled_time}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/student/quiz/${quiz.quizId}`)}
                  className="btn-primary text-sm ml-4">
                  Start Quiz →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
