import { useState, useEffect } from 'react';
import { Search, ChevronDown, X, ExternalLink, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = 'http://localhost:3000';

const avatarColors = [
  'linear-gradient(135deg, #D4A843, #B8882A)',
  'linear-gradient(135deg, #52A0E0, #2A5BB8)',
  'linear-gradient(135deg, #52C4A0, #2AB87E)',
  'linear-gradient(135deg, #E07852, #B84A2A)',
  'linear-gradient(135deg, #A052E0, #7030B8)',
];

export function Users() {
  const { t } = useTheme();

  const [users, setUsers]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [total, setTotal]               = useState(0);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetail, setUserDetail]     = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, offline: 0 });
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token  = localStorage.getItem('admin_token');
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res  = await fetch(`${API_BASE}/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setUsers(data.data ?? []);
      setTotal(data.total ?? 12);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res   = await fetch(`${API_BASE}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      setUserDetail(data);
    } catch (err) {
      console.error('Failed to fetch user detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
        const token = localStorage.getItem('admin_token');
        const res   = await fetch(`${API_BASE}/users/stats`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data  = await res.json();
        setStats(data);
    } catch (err) {
        console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [searchTerm, statusFilter]);

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    fetchUserDetail(user._id);
  };

  const inputStyle: React.CSSProperties = {
    background:   t.inputBg,
    border:       `1px solid ${t.inputBorder}`,
    borderRadius: '8px',
    color:        t.inputText,
    fontSize:     '13px',
    outline:      'none',
  };

  return (
    <div className="p-8 space-y-6" style={{ background: t.bg, minHeight: '100%', transition: 'background 0.2s' }}>

      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '22px', fontWeight: 700 }}>
          User Management
        </h2>
        <p className="mt-1 text-sm" style={{ color: t.textMuted }}>
          Search, filter, and manage all platform users
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: stats.total.toLocaleString() },
          { label: 'Active',      value: stats.active.toLocaleString() },
          { label: 'Inactive',    value: stats.inactive.toLocaleString() },
          { label: 'Offline',     value: stats.offline.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-4 py-3.5" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
            <p className="text-xs" style={{ color: t.textMuted }}>{s.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ fontFamily: 'Syne, sans-serif', color: t.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>

        {/* Filters */}
        <div className="px-5 py-4 flex flex-wrap gap-3 items-center" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
          <div className="relative flex-1" style={{ minWidth: '200px' }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.textFaint }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '100%', paddingLeft: '34px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px' }}
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, appearance: 'none', paddingLeft: '12px', paddingRight: '28px', paddingTop: '8px', paddingBottom: '8px', cursor: 'pointer' } as React.CSSProperties}
            >
              <option value="all"      style={{ background: t.selectOptionBg }}>All Status</option>
              <option value="active"   style={{ background: t.selectOptionBg }}>Active</option>
              <option value="inactive" style={{ background: t.selectOptionBg }}>Inactive</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
          </div>
          <span className="text-xs ml-auto" style={{ color: t.textFaint }}>
            {users.length} of {total} users
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin" style={{ color: '#D4A843' }} />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: t.textMuted }}>No users found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  {['User', 'Email', 'Status', 'Offline', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: t.textFaint, letterSpacing: '0.05em' }}>
                      {h.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => {
                  const name   = `${user.firstName} ${user.lastName}`;
                  const status = user.isActive ? 'Active' : 'Inactive';
                  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—';

                  return (
                    <tr key={user._id} style={{ borderBottom: index < users.length - 1 ? `1px solid ${t.borderSub}` : 'none' }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: avatarColors[index % avatarColors.length] }}
                          >
                            <span className="text-xs font-bold text-white">{name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium" style={{ color: t.text }}>{name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm" style={{ color: t.textMuted }}>{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: status === 'Active' ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                            color:      status === 'Active' ? '#4ade80' : t.textMuted,
                          }}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {user.isOffline && (
                          <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{ background: 'rgba(212,168,67,0.12)', color: '#D4A843' }}
                          >
                            Offline
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: t.textMuted }}>{joined}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                          style={{ color: '#D4A843' }}
                        >
                          <span>View</span>
                          <ExternalLink size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6 mx-4" style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>

            <div className="flex items-start justify-between mb-5">
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '17px', fontWeight: 600 }}>User Details</h3>
              <button
                onClick={() => { setSelectedUser(null); setUserDetail(null); }}
                className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
                style={{ color: t.textMuted, background: t.surfaceHover }}
              >
                <X size={14} />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin" style={{ color: '#D4A843' }} />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: avatarColors[0] }}
                  >
                    <span className="text-xl font-bold text-white">
                      {selectedUser.firstName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold" style={{ color: t.text }}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </p>
                    <p className="text-sm" style={{ color: t.textMuted }}>{selectedUser.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: 'Assigned Moderator',
                      value: userDetail?.moderator
                        ? `${userDetail.moderator.firstName} ${userDetail.moderator.lastName}`
                        : '—',
                    },
                    {
                      label: 'Plan',
                      value: userDetail?.plan?.name ?? '—',
                    },
                    {
                      label: 'Account Status',
                      value: selectedUser.isActive ? 'Active' : 'Inactive',
                    },
                    {
                      label: 'Offline User',
                      value: selectedUser.isOffline ? 'Yes' : 'No',
                    },
                    {
                      label: 'Date Joined',
                      value: selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : '—',
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                      <span className="text-xs" style={{ color: t.textMuted }}>{row.label}</span>
                      <span className="text-sm font-medium" style={{ color: t.text }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => { setSelectedUser(null); setUserDetail(null); }}
              className="w-full mt-5 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: t.surfaceHover, color: t.textSub, border: `1px solid ${t.borderSub}` }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}