import { useState, useEffect } from 'react';
import { Search, ChevronDown, X, Users, CreditCard, ShieldCheck, Loader2, ExternalLink } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const API_BASE = 'http://localhost:3000';

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

  const [moderators, setModerators]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [total, setTotal]               = useState(0);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMod, setSelectedMod]   = useState<any | null>(null);
  const [modDetail, setModDetail]       = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchModerators = async () => {
    setLoading(true);
    try {
      const token  = localStorage.getItem('admin_token');
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') {
        params.append('isVerified', statusFilter === 'active' ? 'true' : 'false');
      }

      const res  = await fetch(`${API_BASE}/moderator?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setModerators(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch moderators:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModeratorDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res   = await fetch(`${API_BASE}/moderator/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      setModDetail(data);
    } catch (err) {
      console.error('Failed to fetch moderator detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchModerators();
  }, [searchTerm, statusFilter]);

  const handleViewMod = (mod: any) => {
    setSelectedMod(mod);
    fetchModeratorDetail(mod._id);
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
          Moderator Management
        </h2>
        <p className="mt-1 text-sm" style={{ color: t.textMuted }}>
          Search, filter, and manage platform moderators
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Moderators', value: total.toLocaleString() },
          { label: 'Active',           value: moderators.filter((m) => m.isVerified).length.toLocaleString() },
          { label: 'Users Managed',    value: moderators.reduce((s, m) => s + (m.userCount ?? 0), 0).toLocaleString() },
          { label: 'Total Paid Out',   value: `₦${(moderators.reduce((s, m) => s + (m.totalEarned ?? 0), 0) / 1000000).toFixed(1)}M` },
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
            {moderators.length} of {total} moderators
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin" style={{ color: '#D4A843' }} />
            </div>
          ) : moderators.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: t.textMuted }}>No moderators found</p>
            </div>
          ) : (
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
                {moderators.map((mod, index) => {
                  const name   = `${mod.firstName} ${mod.lastName}`;
                  const status = mod.isVerified ? 'Active' : 'Inactive';
                  const joined = mod.createdAt ? new Date(mod.createdAt).toLocaleDateString() : '—';

                  return (
                    <tr key={mod._id} style={{ borderBottom: index < moderators.length - 1 ? `1px solid ${t.borderSub}` : 'none' }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: avatarColors[index % avatarColors.length] }}
                          >
                            <span className="text-xs font-bold text-white">{name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: t.text }}>{name}</p>
                            <p className="text-xs" style={{ color: t.textMuted }}>{mod.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium" style={{ color: t.textSub }}>
                        {(mod.userCount ?? 0).toLocaleString()}
                      </td>
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
                        <span className="text-sm font-semibold" style={{ color: '#D4A843' }}>
                          {fmt(mod.totalEarned ?? 0)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: t.textMuted }}>{joined}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleViewMod(mod)}
                          className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-70"
                          style={{ color: '#D4A843' }}
                        >
                          <span>View Users</span>
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

      {/* Moderator detail modal */}
      {selectedMod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-2xl p-6 mx-4" style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>

            <div className="flex items-start justify-between mb-5">
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '17px', fontWeight: 600 }}>Moderator Profile</h3>
              <button
                onClick={() => { setSelectedMod(null); setModDetail(null); }}
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
                {/* Profile header */}
                <div className="flex items-center gap-4 mb-5 pb-5" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: avatarColors[0] }}
                  >
                    <span className="text-xl font-bold text-white">
                      {selectedMod.firstName?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold" style={{ color: t.text }}>
                      {selectedMod.firstName} {selectedMod.lastName}
                    </p>
                    <p className="text-sm" style={{ color: t.textMuted }}>{selectedMod.email}</p>
                  </div>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: selectedMod.isVerified ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                      color:      selectedMod.isVerified ? '#4ade80' : t.textMuted,
                    }}
                  >
                    {selectedMod.isVerified ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Users',        value: (modDetail?.userCount ?? 0).toLocaleString(),                              icon: Users      },
                    { label: 'Total Earned', value: `₦${((modDetail?.totalEarned ?? 0) / 1000000).toFixed(1)}M`,              icon: CreditCard  },
                    { label: 'Joined',       value: selectedMod.createdAt ? new Date(selectedMod.createdAt).toLocaleDateString() : '—', icon: ShieldCheck },
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

                {/* Plan */}
                {modDetail?.plan && (
                  <div className="mb-5 px-3 py-2.5 rounded-lg" style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}>
                    <p className="text-xs" style={{ color: t.textFaint }}>MANAGING PLAN</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: t.text }}>{modDetail.plan.name}</p>
                  </div>
                )}

                {/* Assigned users */}
                <div>
                  <p className="text-xs font-semibold mb-3" style={{ color: t.textFaint, letterSpacing: '0.06em' }}>
                    ASSIGNED USERS ({modDetail?.userCount ?? 0})
                  </p>
                  <div className="space-y-2">
                    {(modDetail?.users ?? []).map((user: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                        style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.2)' }}>
                            <span className="text-[10px] font-bold" style={{ color: '#D4A843' }}>
                              {user.firstName?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-medium" style={{ color: t.text }}>
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-[10px]" style={{ color: t.textMuted }}>{user.email}</p>
                          </div>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background: user.isVerified ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                            color:      user.isVerified ? '#4ade80' : t.textMuted,
                          }}
                        >
                          {user.isVerified ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}

                    {(!modDetail?.users || modDetail.users.length === 0) && (
                      <p className="text-xs text-center py-4" style={{ color: t.textFaint }}>No users assigned</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <button
              onClick={() => { setSelectedMod(null); setModDetail(null); }}
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