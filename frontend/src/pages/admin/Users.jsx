import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import api from '../../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetTarget, setResetTarget] = useState(null); // { id, username }
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data.students || data.users || data.data || []);
    } catch { setUsers([]); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      await api.post('/users', form);
      setSuccess('Student account created');
      setForm({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create student');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    try { await api.delete(`/users/${id}`); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  // SRS: "Manage student login details" — allow admin to activate/deactivate accounts
  const handleToggleActive = async (user) => {
    setTogglingId(user._id);
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally { setTogglingId(null); }
  };

  const handleResetPassword = async () => {
    setResetError('');
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters'); return;
    }
    setResetLoading(true);
    try {
      await api.put(`/users/${resetTarget.id}`, { password: newPassword });
      setResetTarget(null);
      setNewPassword('');
      alert(`Password reset for ${resetTarget.username}`);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Reset failed');
    } finally { setResetLoading(false); }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Students</h1>

        {/* Create student form */}
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Add Student Account</h2>
          {error && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
          {success && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Username <span className="text-gray-400 text-xs">(min 5 chars)</span></label>
              <input className="input" placeholder="studentname" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required minLength={5} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="student@college.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        </div>

        {/* Reset password modal */}
        {resetTarget && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
              <h3 className="font-semibold text-gray-900 mb-1">Reset Password</h3>
              <p className="text-sm text-gray-500 mb-4">Set a new password for <span className="font-medium text-gray-700">{resetTarget.username}</span></p>
              {resetError && <p className="text-sm text-red-600 mb-3">{resetError}</p>}
              <input
                type="password"
                className="input mb-4"
                placeholder="New password (min 6 chars)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                minLength={6}
              />
              <div className="flex gap-3">
                <button onClick={handleResetPassword} disabled={resetLoading} className="btn-primary flex-1 text-sm">
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button onClick={() => { setResetTarget(null); setNewPassword(''); setResetError(''); }}
                  className="btn-secondary flex-1 text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Students table */}
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Username', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No students yet</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.username}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {/* SRS: Manage student login details — toggle active/inactive */}
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={togglingId === u._id || u.role === 'admin'}
                      title={u.role === 'admin' ? 'Cannot deactivate admin' : (u.isActive ? 'Click to deactivate' : 'Click to activate')}
                      className={`text-xs px-2 py-0.5 rounded-full font-medium transition-opacity ${
                        u.role === 'admin' ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:opacity-80'
                      } ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {togglingId === u._id ? '...' : (u.isActive ? 'Active' : 'Inactive')}
                    </button>
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => { setResetTarget({ id: u._id, username: u.username }); setNewPassword(''); setResetError(''); }}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                      Reset Password
                    </button>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDelete(u._id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                    )}
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
