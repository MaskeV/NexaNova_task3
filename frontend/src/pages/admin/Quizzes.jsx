import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../api/client';

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    quizId: '', title: '', subjectId: '', topicId: '',
    duration_minutes: 30, scheduled_date: '', scheduled_time: '10:00',
  });

  const fetchAll = async () => {
    try {
      const [qz, s, t, q] = await Promise.all([
        api.get('/quizzes'), api.get('/subjects'), api.get('/topics'), api.get('/questions')
      ]);
      setQuizzes(qz.data.quizzes || qz.data.data || []);
      setSubjects(s.data.subjects || s.data.data || []);
      setTopics(t.data.topics || t.data.data || []);
      setQuestions(q.data.questions || q.data.data || []);
    } catch { }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (form.subjectId) {
      setFilteredTopics(topics.filter(t => t.subjectId === form.subjectId));
    } else setFilteredTopics([]);
  }, [form.subjectId, topics]);

  useEffect(() => {
    if (form.subjectId && form.topicId) {
      setFilteredQuestions(questions.filter(q => q.subjectId === form.subjectId && q.topicId === form.topicId));
    } else setFilteredQuestions([]);
    setSelectedQuestions([]);
  }, [form.subjectId, form.topicId, questions]);

  const toggleQuestion = (qId) => {
    setSelectedQuestions(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (selectedQuestions.length === 0) { setError('Select at least one question'); return; }
    setLoading(true);
    try {
      await api.post('/quizzes', {
        ...form,
        duration_minutes: Number(form.duration_minutes),
        questions: selectedQuestions.map(qId => ({ questionId: qId })),
      });
      setSuccess('Quiz created successfully');
      setForm({ quizId: '', title: '', subjectId: '', topicId: '', duration_minutes: 30, scheduled_date: '', scheduled_time: '10:00' });
      setSelectedQuestions([]);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try { await api.delete(`/quizzes/${id}`); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Quizzes</h1>

        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Create New Quiz</h2>
          {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="label">Quiz ID</label>
                <input className="input" placeholder="QZ01" value={form.quizId}
                  onChange={e => setForm(f => ({ ...f, quizId: e.target.value.toUpperCase() }))} required />
              </div>
              <div className="md:col-span-2">
                <label className="label">Title</label>
                <input className="input" placeholder="e.g. JavaScript Basics Quiz" value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Subject</label>
                <select className="input" value={form.subjectId}
                  onChange={e => setForm(f => ({ ...f, subjectId: e.target.value, topicId: '' }))} required>
                  <option value="">Select</option>
                  {subjects.map(s => <option key={s._id} value={s.subjectId}>{s.subjectId} — {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Topic</label>
                <select className="input" value={form.topicId}
                  onChange={e => setForm(f => ({ ...f, topicId: e.target.value }))} required>
                  <option value="">Select</option>
                  {filteredTopics.map(t => <option key={t._id} value={t.topicId}>{t.topicId} — {t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Duration (minutes)</label>
                <input type="number" className="input" min={1} value={form.duration_minutes}
                  onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" className="input" value={form.scheduled_date}
                  onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Time (HH:MM)</label>
                <input type="time" className="input" value={form.scheduled_time}
                  onChange={e => setForm(f => ({ ...f, scheduled_time: e.target.value }))} required />
              </div>
            </div>

            {filteredQuestions.length > 0 && (
              <div>
                <label className="label">Select Questions ({selectedQuestions.length} selected)</label>
                <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-56 overflow-y-auto">
                  {filteredQuestions.map(q => (
                    <label key={q._id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 accent-indigo-600"
                        checked={selectedQuestions.includes(q.questionId)}
                        onChange={() => toggleQuestion(q.questionId)} />
                      <div>
                        <span className="font-mono text-xs text-indigo-600 mr-2">{q.questionId}</span>
                        <span className="text-sm">{q.question_text}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Quiz'}
            </button>
          </form>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Title', 'Subject', 'Date', 'Time', 'Duration', 'Qs', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quizzes.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">No quizzes yet</td></tr>
              ) : quizzes.map(q => (
                <tr key={q._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-indigo-600">{q.quizId}</td>
                  <td className="px-4 py-3 font-medium">{q.title}</td>
                  <td className="px-4 py-3 text-gray-500">{q.subjectId}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(q.scheduled_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-500">{q.scheduled_time}</td>
                  <td className="px-4 py-3 text-gray-500">{q.duration_minutes}m</td>
                  <td className="px-4 py-3 text-gray-500">{q.questions?.length || 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(q.quizId)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
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
