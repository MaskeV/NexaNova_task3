import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/common/Layout';

const cards = [
  { to: '/admin/subjects', label: 'Subjects', desc: 'Manage subjects', icon: '📚', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { to: '/admin/topics', label: 'Topics', desc: 'Manage topics', icon: '📖', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { to: '/admin/questions', label: 'Questions', desc: 'Manage questions', icon: '❓', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { to: '/admin/quizzes', label: 'Quizzes', desc: 'Create & schedule', icon: '🧩', color: 'bg-green-50 border-green-200 text-green-700' },
  { to: '/admin/users', label: 'Students', desc: 'Manage students', icon: '👤', color: 'bg-pink-50 border-pink-200 text-pink-700' },
  { to: '/admin/results', label: 'Results', desc: 'View all results', icon: '📊', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}</h1>
        <p className="text-gray-500 text-sm mt-1">Admin dashboard — manage your quiz platform</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(c => (
          <Link key={c.to} to={c.to}
            className={`card p-5 border flex flex-col gap-2 hover:shadow-md transition-shadow ${c.color}`}>
            <span className="text-3xl">{c.icon}</span>
            <div>
              <p className="font-semibold text-base">{c.label}</p>
              <p className="text-xs opacity-70">{c.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
