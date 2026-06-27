import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function QuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});   // { questionId: optionId }
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submitted = useRef(false);

  // Load quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${quizId}`);
        const quizData = data.quiz || data.data || data;
        setQuiz(quizData);
        setTimeLeft((quizData.duration_minutes || 30) * 60);

        // Fetch each question's full details
        const qIds = quizData.questions.map(q => q.questionId);
        const qDetails = await Promise.all(qIds.map(id => api.get(`/questions/${id}`)));
        setQuestions(qDetails.map(r => r.data.question || r.data.data || r.data));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz');
      } finally { setLoading(false); }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitted.current) return;
    submitted.current = true;
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([questionId, selected_option]) => ({
        questionId, selected_option
      }));
      const { data } = await api.post('/results/submit', {
        quizId,
        answers: answersPayload,
        auto_submitted: auto,
      });
      navigate('/student/results', { state: { result: data.result, fromQuiz: true } });
    } catch (err) {
      submitted.current = false;
      setSubmitting(false);
      alert(err.response?.data?.message || 'Submission failed');
    }
  }, [answers, quizId, navigate]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz, handleSubmit]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const getStatus = (i) => {
    const q = questions[i];
    if (!q) return 'unanswered';
    if (i === current) return 'current';
    if (answers[q.questionId]) return 'answered';
    return 'unanswered';
  };

  const statusColor = {
    unanswered: 'bg-red-100 text-red-700 border-red-300',
    current: 'bg-orange-400 text-white border-orange-400',
    answered: 'bg-green-500 text-white border-green-500',
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-400 text-lg">Loading quiz...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={() => navigate('/student')} className="btn-secondary mt-4">Back to Dashboard</button>
      </div>
    </div>
  );

  const q = questions[current];
  const isUrgent = timeLeft <= 60;
  const answered = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div>
          <p className="font-semibold text-gray-900 text-sm">{quiz?.title}</p>
          <p className="text-xs text-gray-400">{quiz?.quizId} · {q ? `Q${current + 1} of ${questions.length}` : ''}</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-lg ${isUrgent ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-indigo-50 text-indigo-700'}`}>
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-6 gap-6">
        {/* Question area */}
        <div className="flex-1 flex flex-col">
          {q && (
            <div className="card p-6 flex-1 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                  {current + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-base leading-relaxed">{q.question_text}</p>
                  {q.code_snippet && (
                    <pre className="mt-3 bg-gray-900 text-green-400 text-xs rounded-lg p-4 overflow-x-auto font-mono">
                      {q.code_snippet}
                    </pre>
                  )}
                </div>
              </div>

              <div className="space-y-3 mt-2 flex-1">
                {q.options?.map((opt) => {
                  const selected = answers[q.questionId] === opt._id;
                  return (
                    <button key={opt._id}
                      onClick={() => setAnswers(a => ({ ...a, [q.questionId]: opt._id }))}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium
                        ${selected
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                          : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-gray-700'}`}>
                      <span className={`inline-flex w-6 h-6 rounded-full mr-3 items-center justify-center text-xs font-bold border
                        ${selected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 text-gray-400'}`}>
                        {String.fromCharCode(65 + q.options.indexOf(opt))}
                      </span>
                      {opt.option_text}
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setCurrent(c => c - 1)}
                  disabled={current === 0}
                  className="btn-secondary text-sm">
                  ← Previous
                </button>
                <span className="text-xs text-gray-400">{answered}/{questions.length} answered</span>
                {current < questions.length - 1 ? (
                  <button onClick={() => setCurrent(c => c + 1)} className="btn-primary text-sm">
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const unanswered = questions.length - answered;
                      if (unanswered > 0 && !confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
                      handleSubmit(false);
                    }}
                    disabled={submitting}
                    className="btn-primary text-sm bg-green-600 hover:bg-green-700">
                    {submitting ? 'Submitting...' : '✓ Submit Quiz'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation panel */}
        <div className="w-56 shrink-0">
          <div className="card p-4 sticky top-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Question Navigator</h3>

            {/* Legend */}
            <div className="space-y-1 mb-4 text-xs">
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-500"></span> Answered</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-orange-400"></span> Current</div>
              <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-100 border border-red-300"></span> Not attempted</div>
            </div>

            {/* Groups of 4 */}
            {Array.from({ length: Math.ceil(questions.length / 4) }, (_, gi) => (
              <div key={gi} className="mb-3">
                <p className="text-xs text-gray-400 mb-1.5">
                  Q{gi * 4 + 1}–{Math.min((gi + 1) * 4, questions.length)}
                </p>
                <div className="grid grid-cols-4 gap-1">
                  {questions.slice(gi * 4, (gi + 1) * 4).map((_, li) => {
                    const idx = gi * 4 + li;
                    const status = getStatus(idx);
                    return (
                      <button key={idx}
                        onClick={() => setCurrent(idx)}
                        className={`w-full aspect-square rounded text-xs font-bold border transition-colors ${statusColor[status]}`}>
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                const unanswered = questions.length - answered;
                if (unanswered > 0 && !confirm(`${unanswered} unanswered question(s). Submit anyway?`)) return;
                handleSubmit(false);
              }}
              disabled={submitting}
              className="btn-primary w-full text-xs mt-3">
              {submitting ? 'Submitting...' : '✓ Final Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
