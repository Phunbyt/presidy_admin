import { useState } from 'react';
import { Search, ChevronDown, X, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const mockUsers = [
  { id: 1, name: 'Alice Cooper',  email: 'alice@example.com',  moderator: 'Sarah Wilson',   status: 'Active',   joined: '2026-01-15', plan: 'Pro'   },
  { id: 2, name: 'Bob Martinez',  email: 'bob@example.com',    moderator: 'Michael Chen',   status: 'Active',   joined: '2026-02-20', plan: 'Basic' },
  { id: 3, name: 'Carol Smith',   email: 'carol@example.com',  moderator: 'Sarah Wilson',   status: 'Inactive', joined: '2026-01-08', plan: 'Basic' },
  { id: 4, name: 'David Lee',     email: 'david@example.com',  moderator: 'Emma Johnson',   status: 'Active',   joined: '2026-03-12', plan: 'Pro'   },
  { id: 5, name: 'Eve Taylor',    email: 'eve@example.com',    moderator: 'James Brown',    status: 'Active',   joined: '2026-02-05', plan: 'Pro'   },
  { id: 6, name: 'Frank Wilson',  email: 'frank@example.com',  moderator: 'Michael Chen',   status: 'Active',   joined: '2026-01-28', plan: 'Basic' },
  { id: 7, name: 'Grace Obi',     email: 'grace@example.com',  moderator: 'Adeola Fashola', status: 'Active',   joined: '2026-03-01', plan: 'Pro'   },
  { id: 8, name: 'Henry Adeyemi', email: 'henry@example.com',  moderator: 'Chidi Okafor',   status: 'Inactive', joined: '2026-02-14', plan: 'Basic' },
];

const avatarColors = [
  'linear-gradient(135deg, #D4A843, #B8882A)',
  'linear-gradient(135deg, #52A0E0, #2A5BB8)',
  'linear-gradient(135deg, #52C4A0, #2AB87E)',
  'linear-gradient(135deg, #E07852, #B84A2A)',
  'linear-gradient(135deg, #A052E0, #7030B8)',
];

export function Users() {
  const { t } = useTheme();
  const [searchTerm, setSearchTerm]         = useState('');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [moderatorFilter, setModeratorFilter] = useState('all');
  const [selectedUser, setSelectedUser]     = useState<typeof mockUsers[0] | null>(null);

  const filtered = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status.toLowerCase() === statusFilter;
    const matchesMod    = moderatorFilter === 'all' || user.moderator === moderatorFilter;
    return matchesSearch && matchesStatus && matchesMod;
  });

  const uniqueModerators = [...new Set(mockUsers.map((u) => u.moderator))];

  const inputStyle: React.CSSProperties = {
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: '8px',
    color: t.inputText,
    fontSize: '13px',
    outline: 'none',
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" style={{ background: t.bg, minHeight: '100%', transition: 'background 0.2s' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700 }}>
          User Management
        </h2>
        <p className="mt-1 text-xs sm:text-sm" style={{ color: t.textMuted }}>
          Search, filter, and manage all platform users
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          { label: 'Total Users', value: mockUsers.length.toLocaleString() },
          { label: 'Active',      value: mockUsers.filter((u) => u.status === 'Active').length.toLocaleString() },
          { label: 'Inactive',    value: mockUsers.filter((u) => u.status === 'Inactive').length.toLocaleString() },
          { label: 'Pro Plan',    value: mockUsers.filter((u) => u.plan === 'Pro').length.toLocaleString() },
        ].map((s) => (
          <div key={s.label} className="rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3.5" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
            <p className="text-xs" style={{ color: t.textMuted }}>{s.label}</p>
            <p className="text-base sm:text-lg font-bold mt-0.5" style={{ fontFamily: 'Syne, sans-serif', color: t.text }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-lg sm:rounded-xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        {/* Filters */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
          <div className="relative flex-1 w-full sm:w-auto" style={{ minWidth: '0' }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.textFaint }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '100%', paddingLeft: '34px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px' }}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, appearance: 'none', paddingLeft: '12px', paddingRight: '28px', paddingTop: '8px', paddingBottom: '8px', cursor: 'pointer', width: '100%' } as React.CSSProperties}
            >
              <option value="all"      style={{ background: t.selectOptionBg }}>All Status</option>
              <option value="active"   style={{ background: t.selectOptionBg }}>Active</option>
              <option value="inactive" style={{ background: t.selectOptionBg }}>Inactive</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
          </div>
          <div className="relative w-full sm:w-auto">
            <select
              value={moderatorFilter}
              onChange={(e) => setModeratorFilter(e.target.value)}
              style={{ ...inputStyle, appearance: 'none', paddingLeft: '12px', paddingRight: '28px', paddingTop: '8px', paddingBottom: '8px', cursor: 'pointer', width: '100%' } as React.CSSProperties}
            >
              <option value="all" style={{ background: t.selectOptionBg }}>All Moderators</option>
              {uniqueModerators.map((m) => (
                <option key={m} value={m} style={{ background: t.selectOptionBg }}>{m}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
          </div>
          <span className="text-xs w-full sm:w-auto" style={{ color: t.textFaint }}>
            {filtered.length} of {mockUsers.length}
          </span>
        </div>

        {/* Table - responsive wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                {['User', 'Email', 'Moderator', 'Plan', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-3 sm:px-5 py-2 sm:py-3 text-left font-semibold whitespace-nowrap" style={{ color: t.textFaint, letterSpacing: '0.05em', fontSize: '10px' }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, index) => (
                <tr
                  key={user.id}
                  style={{ borderBottom: index < filtered.length - 1 ? `1px solid ${t.borderSub}` : 'none' }}
                >
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: avatarColors[user.id % avatarColors.length] }}
                      >
                        <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium truncate" style={{ color: t.text }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm truncate" style={{ color: t.textMuted }}>{user.email}</td>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs sm:text-sm truncate" style={{ color: t.textSub }}>{user.moderator}</td>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                      style={{
                        background: user.plan === 'Pro' ? 'rgba(212,168,67,0.12)' : t.surfaceHover,
                        color: user.plan === 'Pro' ? '#D4A843' : t.textMuted,
                      }}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                      style={{
                        background: user.status === 'Active' ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                        color: user.status === 'Active' ? '#4ade80' : t.textMuted,
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5 text-xs whitespace-nowrap" style={{ color: t.textMuted }}>{user.joined}</td>
                  <td className="px-3 sm:px-5 py-2.5 sm:py-3.5">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
                      style={{ color: '#D4A843' }}
                    >
                      <span>View</span>
                      <ExternalLink size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-lg sm:rounded-2xl p-4 sm:p-6" style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="flex items-start justify-between mb-5">
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: 'clamp(15px, 4vw, 17px)', fontWeight: 600 }}>User Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-7 h-7 rounded-md flex items-center justify-center transition-all flex-shrink-0"
                style={{ color: t.textMuted, background: t.surfaceHover }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mb-6 pb-5" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
              <div
                className="w-10 sm:w-14 h-10 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: avatarColors[selectedUser.id % avatarColors.length] }}
              >
                <span className="text-lg sm:text-xl font-bold text-white">{selectedUser.name.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: t.text }}>{selectedUser.name}</p>
                <p className="text-xs truncate" style={{ color: t.textMuted }}>{selectedUser.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Assigned Moderator', value: selectedUser.moderator },
                { label: 'Account Status',     value: selectedUser.status   },
                { label: 'Subscription Plan',  value: selectedUser.plan     },
                { label: 'Date Joined',        value: selectedUser.joined   },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  <span className="text-xs" style={{ color: t.textMuted }}>{row.label}</span>
                  <span className="text-sm font-medium truncate" style={{ color: t.text }}>{row.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedUser(null)}
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
