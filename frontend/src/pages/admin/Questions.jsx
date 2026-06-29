import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../api/client';

const emptyOption = () => ({ option_text: '', is_correct: false });

export default function Questions() {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    questionId: '', subjectId: '', topicId: '',
    question_text: '', question_type: 'Objective',
    code_snippet: '', marks: 1,
    options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
  });

  const isObjective = form.question_type === 'Objective';

  const fetchAll = async () => {
    try {
      const [q, s, t] = await Promise.all([
        api.get('/questions'), api.get('/subjects'), api.get('/topics')
      ]);
      setQuestions(q.data.questions || q.data.data || []);
      setSubjects(s.data.subjects || s.data.data || []);
      setTopics(t.data.topics || t.data.data || []);
    } catch { }
  };

  useEffect(() => { fetchAll(); }, []);

  useEffect(() => {
    if (form.subjectId) {
      setFilteredTopics(topics.filter(t => t.subjectId === form.subjectId));
    } else setFilteredTopics([]);
  }, [form.subjectId, topics]);

  // Reset options when switching type
  const handleTypeChange = (type) => {
    setForm(f => ({
      ...f,
      question_type: type,
      options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
    }));
  };

  const setOption = (i, field, value) => {
    const opts = [...form.options];
    if (field === 'is_correct') {
      opts.forEach((o, idx) => opts[idx] = { ...o, is_correct: idx === i });
    } else {
      opts[i] = { ...opts[i], [field]: value };
    }
    setForm(f => ({ ...f, options: opts }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (isObjective) {
      // Validate all 4 options are filled
      const emptyOpts = form.options.filter(o => !o.option_text.trim());
      if (emptyOpts.length > 0) {
        setError('Please fill in all 4 option texts for an Objective question');
        return;
      }
      if (!form.options.some(o => o.is_correct)) {
        setError('Please mark one option as correct');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        questionId: form.questionId,
        subjectId: form.subjectId,
        topicId: form.topicId,
        question_text: form.question_text,
        question_type: form.question_type,
        marks: Number(form.marks),
      };
      if (form.code_snippet.trim()) payload.code_snippet = form.code_snippet;
      // Only send options for Objective questions
      if (isObjective) payload.options = form.options;

      await api.post('/questions', payload);
      setSuccess('Question created successfully');
      setForm({
        questionId: '', subjectId: '', topicId: '',
        question_text: '', question_type: 'Objective', code_snippet: '', marks: 1,
        options: [emptyOption(), emptyOption(), emptyOption(), emptyOption()],
      });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create question');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return;
    try { await api.delete(`/questions/${id}`); fetchAll(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Questions</h1>

        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Add New Question</h2>
          {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Question ID</label>
                <input className="input" placeholder="Q01" value={form.questionId}
                  onChange={e => setForm(f => ({ ...f, questionId: e.target.value.toUpperCase() }))} required />
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
                <label className="label">Type</label>
                <select className="input" value={form.question_type}
                  onChange={e => handleTypeChange(e.target.value)}>
                  <option value="Objective">Objective</option>
                  <option value="Descriptive">Descriptive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Question Text</label>
              <textarea className="input resize-none" rows={2} value={form.question_text}
                onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} required />
            </div>

            <div>
              <label className="label">Code Snippet <span className="text-gray-400 text-xs">(optional)</span></label>
              <textarea className="input font-mono text-xs resize-none" rows={3} placeholder="Paste code here..."
                value={form.code_snippet} onChange={e => setForm(f => ({ ...f, code_snippet: e.target.value }))} />
            </div>

            {/* Options — only shown for Objective questions */}
            {isObjective ? (
              <div>
                <label className="label mb-2">Options — select the correct answer</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {form.options.map((opt, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${opt.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-200'}`}>
                      <input type="radio" name="correct" checked={opt.is_correct}
                        onChange={() => setOption(i, 'is_correct', true)}
                        className="accent-green-500 w-4 h-4 shrink-0" />
                      <input
                        className="flex-1 text-sm border-0 bg-transparent outline-none"
                        placeholder={`Option ${i + 1}`}
                        value={opt.option_text}
                        onChange={e => setOption(i, 'option_text', e.target.value)}
                      />
                      {opt.is_correct && <span className="text-xs text-green-600 font-medium shrink-0">Correct</span>}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-purple-50 border border-purple-200 rounded-lg text-purple-700 text-sm">
                📝 Descriptive question — no options needed. Students will answer in their own words.
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Question'}
            </button>
          </form>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['ID', 'Question', 'Subject', 'Topic', 'Type', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No questions yet</td></tr>
              ) : questions.map(q => (
                <tr key={q._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-indigo-600">{q.questionId}</td>
                  <td className="px-4 py-3 max-w-xs truncate font-medium">{q.question_text}</td>
                  <td className="px-4 py-3 text-gray-500">{q.subjectId}</td>
                  <td className="px-4 py-3 text-gray-500">{q.topicId}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${q.question_type === 'Objective' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {q.question_type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(q.questionId)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
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
