import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../api/client';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subjectId: '', name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects');
      setSubjects(data.subjects || data.data || []);
    } catch { setSubjects([]); }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/subjects', form);
      setSuccess('Subject created successfully');
      setForm({ subjectId: '', name: '', description: '' });
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subject');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return;
    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Subjects</h1>

        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Add New Subject</h2>
          {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Subject ID <span className="text-gray-400 text-xs">(e.g. SB01)</span></label>
              <input className="input" placeholder="SB01" value={form.subjectId}
                onChange={e => setForm(f => ({ ...f, subjectId: e.target.value.toUpperCase() }))} required />
            </div>
            <div>
              <label className="label">Subject Name</label>
              <input className="input" placeholder="e.g. JavaScript" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea className="input resize-none" rows={2} placeholder="Brief description (10–500 chars)"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Subject'}
              </button>
            </div>
          </form>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Name', 'Description', 'Topics', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subjects.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No subjects yet</td></tr>
              ) : subjects.map(s => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-indigo-600">{s.subjectId}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{s.description}</td>
                  <td className="px-4 py-3 text-gray-500">{s.topics?.length || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s.subjectId)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
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
