import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../api/client';

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ topicId: '', subjectId: '', name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAll = async () => {
    try {
      const [t, s] = await Promise.all([api.get('/topics'), api.get('/subjects')]);
      setTopics(t.data.topics || t.data.data || []);
      setSubjects(s.data.subjects || s.data.data || []);
    } catch { }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/topics', form);
      setSuccess('Topic created successfully');
      setForm({ topicId: '', subjectId: '', name: '', description: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create topic');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this topic?')) return;
    try {
      await api.delete(`/topics/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Topics</h1>

        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Add New Topic</h2>
          {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Topic ID <span className="text-gray-400 text-xs">(e.g. T01)</span></label>
              <input className="input" placeholder="T01" value={form.topicId}
                onChange={e => setForm(f => ({ ...f, topicId: e.target.value.toUpperCase() }))} required />
            </div>
            <div>
              <label className="label">Subject</label>
              <select className="input" value={form.subjectId}
                onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} required>
                <option value="">Select subject</option>
                {subjects.map(s => <option key={s._id} value={s.subjectId}>{s.subjectId} — {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Topic Name</label>
              <input className="input" placeholder="e.g. Variables and Scope" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Description</label>
              <input className="input" placeholder="Brief description" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Topic'}
              </button>
            </div>
          </form>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Topic ID', 'Name', 'Subject', 'Description', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topics.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No topics yet</td></tr>
              ) : topics.map(t => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-indigo-600">{t.topicId}</td>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500">{t.subjectId}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{t.description}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(t.topicId)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
