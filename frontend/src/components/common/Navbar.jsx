import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/topics', label: 'Topics' },
    { to: '/admin/questions', label: 'Questions' },
    { to: '/admin/quizzes', label: 'Quizzes' },
    { to: '/admin/results', label: 'Results' },
  ];

  const studentLinks = [
    { to: '/student', label: 'Dashboard' },
    { to: '/student/results', label: 'My Results' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="bg-indigo-700 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg tracking-tight">NexaNova Quiz</span>
          <div className="hidden md:flex gap-1">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className="px-3 py-1.5 rounded-md text-sm hover:bg-indigo-600 transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-indigo-200 capitalize">{user?.username}  {user?.role}</span>
          <button onClick={handleLogout}
            className="text-sm px-3 py-1.5 rounded-md bg-indigo-800 hover:bg-indigo-900 transition-colors">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
