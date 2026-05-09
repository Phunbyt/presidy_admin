import { useState } from 'react';
import { Search, ChevronDown, X, Users, CreditCard, ShieldCheck } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const mockModerators = [
  {
    id: 1, name: 'Sarah Wilson',   email: 'sarah@example.com',   userCount: 342, status: 'Active',   joined: '2025-08-15', totalEarned: 12450000,
    users: [
      { name: 'Alice Cooper', email: 'alice@example.com', status: 'Active'   },
      { name: 'Carol Smith',  email: 'carol@example.com', status: 'Inactive' },
    ],
  },
  {
    id: 2, name: 'Michael Chen',   email: 'michael@example.com', userCount: 298, status: 'Active',   joined: '2025-09-20', totalEarned: 10890000,
    users: [
      { name: 'Bob Martinez',  email: 'bob@example.com',   status: 'Active' },
      { name: 'Frank Wilson',  email: 'frank@example.com', status: 'Active' },
    ],
  },
  {
    id: 3, name: 'Emma Johnson',   email: 'emma@example.com',    userCount: 256, status: 'Active',   joined: '2025-10-08', totalEarned: 9520000,
    users: [{ name: 'David Lee', email: 'david@example.com', status: 'Active' }],
  },
  {
    id: 4, name: 'James Brown',    email: 'james@example.com',   userCount: 189, status: 'Inactive', joined: '2025-11-12', totalEarned: 7390000,
    users: [{ name: 'Eve Taylor', email: 'eve@example.com', status: 'Active' }],
  },
  {
    id: 5, name: 'Adeola Fashola', email: 'adeola@example.com',  userCount: 315, status: 'Active',   joined: '2025-07-22', totalEarned: 11200000,
    users: [{ name: 'Grace Obi', email: 'grace@example.com', status: 'Active' }],
  },
];

const avatarColors = [
  'linear-gradient(135deg, #D4A843, #B8882A)',
  'linear-gradient(135deg, #52A0E0, #2A5BB8)',
  'linear-gradient(135deg, #52C4A0, #2AB87E)',
  'linear-gradient(135deg, #E07852, #B84A2A)',
  'linear-gradient(135deg, #A052E0, #7030B8)',
];

const fmt = (n: number) => `₦${n.toLocaleString()}`;

export function Moderators() {
  const { t } = useTheme();
  const [searchTerm, setSearchTerm]   = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMod, setSelectedMod] = useState<typeof mockModerators[0] | null>(null);

  const filtered = mockModerators.filter((mod) => {
    const matchesSearch =
      mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mod.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inputStyle: React.CSSProperties = {
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: '8px',
    color: t.inputText,
    fontSize: '13px',
    outline: 'none',
  };

  return (
    <div className="p-8 space-y-6" style={{ background: t.bg, minHeight: '100%', transition: 'background 0.2s' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '22px', fontWeight: 700 }}>
          Moderator Management
        </h2>
        <p className="mt-1 text-sm" style={{ color: t.textMuted }}>
          Search, filter, and manage platform moderators
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Moderators', value: mockModerators.length },
          { label: 'Active',           value: mockModerators.filter((m) => m.status === 'Active').length },
          { label: 'Users Managed',    value: mockModerators.reduce((s, m) => s + m.userCount, 0).toLocaleString() },
          { label: 'Total Paid Out',   value: `₦${(mockModerators.reduce((s, m) => s + m.totalEarned, 0) / 1000000).toFixed(1)}M` },
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
            {filtered.length} of {mockModerators.length} moderators
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                {['Moderator', 'Users', 'Status', 'Total Earned', 'Joined', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: t.textFaint, letterSpacing: '0.05em' }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((mod, index) => (
                <tr
                  key={mod.id}
                  style={{ borderBottom: index < filtered.length - 1 ? `1px solid ${t.borderSub}` : 'none' }}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: avatarColors[mod.id % avatarColors.length] }}
                      >
                        <span className="text-xs font-bold text-white">{mod.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: t.text }}>{mod.name}</p>
                        <p className="text-xs" style={{ color: t.textMuted }}>{mod.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium" style={{ color: t.textSub }}>
                    {mod.userCount.toLocaleString()}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: mod.status === 'Active' ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                        color: mod.status === 'Active' ? '#4ade80' : t.textMuted,
                      }}
                    >
                      {mod.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold" style={{ color: '#D4A843' }}>{fmt(mod.totalEarned)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs" style={{ color: t.textMuted }}>{mod.joined}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => setSelectedMod(mod)}
                      className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ color: '#D4A843' }}
                    >
                      <span>View Users</span>
                      <Users size={11} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderator detail modal */}
      {selectedMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 mx-4" style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}>
            <div className="flex items-start justify-between mb-5">
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '17px', fontWeight: 600 }}>Moderator Profile</h3>
              <button
                onClick={() => setSelectedMod(null)}
                className="w-7 h-7 rounded-md flex items-center justify-center transition-all"
                style={{ color: t.textMuted, background: t.surfaceHover }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: avatarColors[selectedMod.id % avatarColors.length] }}
              >
                <span className="text-xl font-bold text-white">{selectedMod.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold" style={{ color: t.text }}>{selectedMod.name}</p>
                <p className="text-sm" style={{ color: t.textMuted }}>{selectedMod.email}</p>
              </div>
              <span
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  background: selectedMod.status === 'Active' ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                  color: selectedMod.status === 'Active' ? '#4ade80' : t.textMuted,
                }}
              >
                {selectedMod.status}
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Users',        value: selectedMod.userCount.toLocaleString(), icon: Users      },
                { label: 'Total Earned', value: `₦${(selectedMod.totalEarned / 1000000).toFixed(1)}M`,  icon: CreditCard  },
                { label: 'Joined',       value: selectedMod.joined,                    icon: ShieldCheck },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-lg p-3 text-center" style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}>
                    <Icon size={13} className="mx-auto mb-1.5" style={{ color: '#D4A843' }} />
                    <p className="text-xs font-semibold" style={{ color: t.text }}>{s.value}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: t.textMuted }}>{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Assigned users */}
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: t.textFaint, letterSpacing: '0.06em' }}>ASSIGNED USERS (sample)</p>
              <div className="space-y-2">
                {selectedMod.users.map((user, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                    style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.2)' }}>
                        <span className="text-[10px] font-bold" style={{ color: '#D4A843' }}>{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium" style={{ color: t.text }}>{user.name}</p>
                        <p className="text-[10px]" style={{ color: t.textMuted }}>{user.email}</p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                      style={{
                        background: user.status === 'Active' ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                        color: user.status === 'Active' ? '#4ade80' : t.textMuted,
                      }}
                    >
                      {user.status}
                    </span>
                  </div>
                ))}
                <p className="text-xs text-center pt-1" style={{ color: t.textFaint }}>
                  +{selectedMod.userCount - selectedMod.users.length} more users
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedMod(null)}
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
