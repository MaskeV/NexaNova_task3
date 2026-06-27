import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import api from '../../api/client';

export default function StudentResults() {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const justSubmitted = location.state?.fromQuiz;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [r, s] = await Promise.all([
          api.get('/results/my'),
          api.get('/results/my/summary')
        ]);
        setResults(r.data.results || []);
        setSummary(s.data.summary || null);
      } catch { }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const pctColor = (p) => {
    if (p >= 75) return 'text-green-600';
    if (p >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Results</h1>
            <p className="text-gray-500 text-sm mt-0.5">Read-only view of all attempted quizzes</p>
          </div>
          <Link to="/student" className="btn-secondary text-sm">← Dashboard</Link>
        </div>

        {justSubmitted && (
          <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">
            ✓ Quiz submitted successfully! Your result is shown below.
          </div>
        )}

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Quizzes Attempted', value: summary.total_attempted, color: 'bg-indigo-50 text-indigo-700' },
              { label: 'Average Score', value: `${summary.average_score}%`, color: 'bg-amber-50 text-amber-700' },
              { label: 'Best Score', value: `${summary.best_score}%`, color: 'bg-green-50 text-green-700' },
            ].map(c => (
              <div key={c.label} className={`card p-5 ${c.color} border-0`}>
                <p className="text-xs font-medium uppercase tracking-wide opacity-70 mb-1">{c.label}</p>
                <p className="text-3xl font-bold">{c.value}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-5xl mb-3">📝</div>
            <p className="font-semibold text-gray-700">No results yet</p>
            <p className="text-gray-400 text-sm mt-1">Attempt a quiz to see your results here</p>
            <Link to="/student" className="btn-primary mt-4 text-sm inline-flex">Go to Dashboard</Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Quiz', 'Subject', 'Topic', 'Date', 'Total', 'Obtained', 'Percentage', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{r.quiz?.title || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{r.subjectId}</td>
                    <td className="px-4 py-3 text-gray-500">{r.topicId}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(r.quiz_date).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-700">{r.total_marks}</td>
                    <td className="px-4 py-3 font-medium">{r.marks_obtained}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold text-base ${pctColor(r.percentage)}`}>{r.percentage}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
