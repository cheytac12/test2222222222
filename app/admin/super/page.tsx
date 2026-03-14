'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

interface AdminUser {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'superadmin';
  created_at: string;
}

const ROLE_BADGE: Record<string, string> = {
  superadmin: 'bg-purple-50 text-purple-700 border-purple-200',
  admin: 'bg-blue-50 text-blue-700 border-blue-200',
};

/**
 * SuperAdminDashboard – protected page only accessible via a valid
 * super_admin_session cookie (set by /api/super-admin/login).
 * Allows viewing, removing, role-managing, and creating admin accounts.
 */
export default function SuperAdminDashboard() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Confirm dialog state
  const [confirmTarget, setConfirmTarget] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<'remove' | 'revoke' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Create admin form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', phone: '', password: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/super/users');
      if (res.status === 403 || res.status === 401) {
        router.push('/super-admin/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setAdmins(data.admins ?? []);
    } catch {
      setError('Failed to load admin list.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  async function handleLogout() {
    await fetch('/api/super-admin/logout', { method: 'POST' });
    router.push('/super-admin/login');
  }

  function openConfirm(admin: AdminUser, action: 'remove' | 'revoke') {
    setConfirmTarget(admin);
    setConfirmAction(action);
    setActionError('');
    setActionSuccess('');
  }

  async function executeAction() {
    if (!confirmTarget || !confirmAction) return;
    setActionLoading(true);
    setActionError('');

    try {
      let res: Response;
      if (confirmAction === 'remove') {
        res = await fetch('/api/admin/super/users', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: confirmTarget.id }),
        });
      } else {
        // revoke → downgrade to 'admin'
        res = await fetch('/api/admin/super/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: confirmTarget.id, role: 'admin' }),
        });
      }

      if (!res.ok) {
        const d = await res.json();
        setActionError(d.error ?? 'Action failed');
        return;
      }

      const label = confirmAction === 'remove'
        ? `${confirmTarget.name} has been removed.`
        : `${confirmTarget.name}'s role reverted to Admin.`;
      setActionSuccess(label);
      setConfirmTarget(null);
      setConfirmAction(null);
      fetchAdmins();
    } catch {
      setActionError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleCreateFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!createForm.name || !createForm.phone || !createForm.password) {
      setCreateError('Name, phone, and password are required.');
      return;
    }
    if (createForm.password.length < 8) {
      setCreateError('Password must be at least 8 characters.');
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch('/api/super-admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();

      if (!res.ok) {
        setCreateError(data.error ?? 'Failed to create admin.');
        return;
      }

      setCreateSuccess(`Admin account for "${createForm.name}" created successfully.`);
      setCreateForm({ name: '', phone: '', password: '' });
      setShowCreateForm(false);
      fetchAdmins();
    } catch {
      setCreateError('Network error. Please try again.');
    } finally {
      setCreateLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 px-6 py-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-900 transition-colors text-xs flex items-center gap-1.5 uppercase tracking-wide">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-700 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.249-8.25-3.286z" />
                </svg>
              </div>
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wide">Super Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setShowCreateForm(true); setCreateError(''); setCreateSuccess(''); }}
              className="text-xs border border-purple-200 hover:bg-purple-700 hover:text-white hover:border-purple-700 text-purple-700 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wide"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Admin
            </button>
            <button
              onClick={handleLogout}
              className="text-xs border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 text-red-600 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 uppercase tracking-wide"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-6">
        {/* Header */}
        <div className="mb-6">
          <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">User Management</p>
          <h1 className="text-xl font-bold text-gray-900">Admin &amp; User Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, manage, and provision admin accounts on the platform.</p>
        </div>

        {/* Success banner */}
        {(actionSuccess || createSuccess) && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-sm px-4 py-3 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {actionSuccess || createSuccess}
            <button onClick={() => { setActionSuccess(''); setCreateSuccess(''); }} className="ml-auto text-green-600 hover:text-green-900">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-sm px-4 py-3 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 mb-8 border border-gray-200">
          {[
            { label: 'Total Admins', value: admins.length, accent: 'border-t-4 border-t-gray-900' },
            { label: 'Super Admins', value: admins.filter((a) => a.role === 'superadmin').length, accent: 'border-t-4 border-t-purple-700' },
            { label: 'Standard Admins', value: admins.filter((a) => a.role === 'admin').length, accent: 'border-t-4 border-t-blue-700' },
          ].map((s, i) => (
            <div key={s.label} className={`bg-white p-6 border-gray-200 ${i > 0 ? 'border-l' : ''} ${s.accent}`}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-2">{s.label}</p>
              <p className="text-4xl font-light text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Admin list table */}
        {loading ? (
          <div className="bg-white border border-gray-200 p-16 text-center">
            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-mono uppercase tracking-widest text-gray-400">Loading admins…</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-white border border-gray-200 p-16 text-center">
            <p className="text-sm font-medium text-gray-700">No admins found</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 border-b border-gray-200">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">All Admins</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {['Name', 'Phone', 'Role', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-mono uppercase tracking-widest text-gray-400 whitespace-nowrap border-b border-gray-100">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs whitespace-nowrap">{admin.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">{admin.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold border uppercase tracking-wide ${
                            ROLE_BADGE[admin.role] ?? 'bg-gray-50 text-gray-600 border-gray-200'
                          }`}
                        >
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs font-mono whitespace-nowrap">
                        {formatDate(admin.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {admin.role === 'superadmin' && (
                            <button
                              onClick={() => openConfirm(admin, 'revoke')}
                              className="border border-orange-200 hover:bg-orange-600 hover:text-white hover:border-orange-600 text-orange-600 px-2.5 py-1 rounded-sm text-xs font-medium transition-all uppercase tracking-wide"
                            >
                              Revoke Super
                            </button>
                          )}
                          <button
                            onClick={() => openConfirm(admin, 'remove')}
                            className="border border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 text-red-600 px-2.5 py-1 rounded-sm text-xs font-medium transition-all uppercase tracking-wide"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 bg-[#F7F7F5]">
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                {admins.length} admin{admins.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Create Admin Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 border-t-4 border-t-purple-700 max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Admin Management</p>
                <h3 className="text-base font-bold text-gray-900">Create New Admin</h3>
              </div>
              <button
                onClick={() => { setShowCreateForm(false); setCreateError(''); }}
                className="text-gray-400 hover:text-gray-900 transition-colors ml-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              {createError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {createError}
                </div>
              )}

              <div>
                <label htmlFor="create-name" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  id="create-name"
                  name="name"
                  type="text"
                  value={createForm.name}
                  onChange={handleCreateFormChange}
                  placeholder="John Smith"
                  required
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-700 focus:border-purple-700"
                />
              </div>

              <div>
                <label htmlFor="create-phone" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <input
                  id="create-phone"
                  name="phone"
                  type="tel"
                  value={createForm.phone}
                  onChange={handleCreateFormChange}
                  placeholder="+1234567890"
                  required
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-700 focus:border-purple-700"
                />
              </div>

              <div>
                <label htmlFor="create-password" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <input
                  id="create-password"
                  name="password"
                  type="password"
                  value={createForm.password}
                  onChange={handleCreateFormChange}
                  placeholder="Min. 8 characters"
                  required
                  minLength={8}
                  className="w-full border border-gray-200 rounded-sm px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-700 focus:border-purple-700"
                />
                <p className="text-[10px] text-gray-400 mt-1">Must be at least 8 characters. The password will be securely hashed.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 bg-purple-700 hover:bg-purple-800 text-white px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createLoading ? (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Create Admin
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); setCreateError(''); }}
                  className="flex-1 border border-gray-200 hover:border-gray-400 text-gray-600 px-4 py-2.5 rounded-sm font-medium text-xs uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmTarget && confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 border-t-4 border-t-red-600 max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">Confirm Action</p>
                <h3 className="text-base font-bold text-gray-900">
                  {confirmAction === 'remove' ? 'Remove Admin' : 'Revoke Super Admin'}
                </h3>
              </div>
              <button
                onClick={() => { setConfirmTarget(null); setConfirmAction(null); setActionError(''); }}
                className="text-gray-400 hover:text-gray-900 transition-colors ml-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {actionError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                  {actionError}
                </div>
              )}
              <p className="text-sm text-gray-700">
                {confirmAction === 'remove'
                  ? <>Are you sure you want to <strong>permanently remove</strong> <strong className="text-gray-900">{confirmTarget.name}</strong> from the platform? This action cannot be undone.</>
                  : <>Are you sure you want to <strong>revoke Super Admin privileges</strong> for <strong className="text-gray-900">{confirmTarget.name}</strong>? They will be downgraded to a standard Admin.</>
                }
              </p>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={executeAction}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-sm font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  confirmAction === 'remove' ? 'Remove Admin' : 'Revoke Privileges'
                )}
              </button>
              <button
                onClick={() => { setConfirmTarget(null); setConfirmAction(null); setActionError(''); }}
                className="flex-1 border border-gray-200 hover:border-gray-400 text-gray-600 px-4 py-2.5 rounded-sm font-medium text-xs uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
