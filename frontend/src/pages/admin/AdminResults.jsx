import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../api/client';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/results').then(({ data }) => {
      setResults(data.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">All Student Results</h1>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Student', 'Email', 'Quiz', 'Subject', 'Date', 'Marks', 'Percentage', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {results.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8 text-gray-400">No results yet</td></tr>
                ) : results.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.student?.username || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{r.student?.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{r.quiz?.title || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{r.subjectId}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(r.quiz_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{r.marks_obtained}/{r.total_marks}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${r.percentage >= 50 ? 'text-green-600' : 'text-red-600'}`}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
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
