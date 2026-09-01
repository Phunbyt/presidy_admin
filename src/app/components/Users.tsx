import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronLeft, ChevronRight, X, ExternalLink, Phone, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { PlanLogo, Plan } from './PlanLogo';

const API_BASE = 'https://api.presidy.com/api/v1';
const KNOWN_PLANS: Plan[] = ['Spotify', 'Apple Music', 'YouTube Music'];
const PER_PAGE_OPTIONS = [5, 10, 25, 50];
const unwrap = (res: any) => res?.data ?? res;
function safePlan(name?: string | null): Plan | null {
  return name && KNOWN_PLANS.includes(name as Plan) ? (name as Plan) : null;
}

/** Returns page numbers to render; 0 = ellipsis */
function buildPageList(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: number[] = [];
  const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
  add(1);
  if (current > 3)       pages.push(0);
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) add(p);
  if (current < total - 2) pages.push(0);
  add(total);
  return pages;
}

const avatarColors = [
  'linear-gradient(135deg, #D4A843, #B8882A)',
  'linear-gradient(135deg, #52A0E0, #2A5BB8)',
  'linear-gradient(135deg, #52C4A0, #2AB87E)',
  'linear-gradient(135deg, #E07852, #B84A2A)',
  'linear-gradient(135deg, #A052E0, #7030B8)',
  'linear-gradient(135deg, #E0D452, #B8A82A)',
];

export function Users() {
  const { t } = useTheme();

  const [users, setUsers]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [page, setPage]                 = useState(1);
  const [perPage, setPerPage]           = useState(10);

  const [searchTerm, setSearchTerm]           = useState('');
  const [statusFilter, setStatusFilter]       = useState('all');
  const [moderatorFilter, setModeratorFilter] = useState('all');
  const [planFilter, setPlanFilter]           = useState('all');

  const [plans, setPlans]                     = useState<any[]>([]);
  const [moderatorsList, setModeratorsList]   = useState<any[]>([]);

  // independent stats — NOT derived from the currently loaded page
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, offline: 0 });

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetail, setUserDetail]     = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── load filter dropdown data + stats once ──
  useEffect(() => {
    const token = localStorage.getItem('admin_token');

    const fetchPlans = async () => {
      try {
        const res  = await fetch(`${API_BASE}/plan/plans`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setPlans(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setPlans([]);
      }
    };

    const fetchModeratorsList = async () => {
      try {
        const res  = await fetch(`${API_BASE}/moderator?limit=1000`, { headers: { Authorization: `Bearer ${token}` } });
        const data= await res.json();
        //const data = unwrap(raw)
        setModeratorsList(data.data ?? []);
      } catch (err) {
        console.error('Failed to fetch moderators:', err);
        setModeratorsList([]);
      }
    };

    const fetchStats = async () => {
      try {
        const res  = await fetch(`${API_BASE}/user/stats`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setStats(data.data ?? data);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
      }
    };

    fetchPlans();
    fetchModeratorsList();
    fetchStats();
  }, []);

  // ── reset to page 1 whenever a filter or page-size changes ──
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, moderatorFilter, planFilter, perPage]);

  // ── fetch the current page of users ──
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token  = localStorage.getItem('admin_token');
        const params = new URLSearchParams();

        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all')    params.append('status', statusFilter);
        if (planFilter !== 'all')      params.append('planId', planFilter);
        if (moderatorFilter !== 'all') params.append('moderatorId', moderatorFilter);
        params.append('page', String(page));
        params.append('limit', String(perPage));

        const res  = await fetch(`${API_BASE}/user?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        setUsers(data.data ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm, statusFilter, moderatorFilter, planFilter, perPage, page]);

  const fetchUserDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res   = await fetch(`${API_BASE}/user/${id}`, {
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

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    fetchUserDetail(user._id);
  };

  const pageStart   = total === 0 ? 0 : (page - 1) * perPage + 1;
  const pageEnd     = Math.min(page * perPage, total);
  const pageNumbers = buildPageList(page, totalPages);

  const inputStyle: React.CSSProperties = {
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: '8px',
    color: t.inputText,
    fontSize: '13px',
    outline: 'none',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none',
    paddingLeft: '12px',
    paddingRight: '28px',
    paddingTop: '8px',
    paddingBottom: '8px',
    cursor: 'pointer',
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

      {/* Quick stats — independent of current page/filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Users',   value: stats.total },
          { label: 'Active',        value: stats.active },
          { label: 'Inactive',      value: stats.inactive },
          { label: 'Offline Users', value: stats.offline },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-4 py-3.5" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
            <p className="text-xs" style={{ color: t.textMuted }}>{s.label}</p>
            <p className="text-lg font-bold mt-0.5" style={{ fontFamily: 'Syne, sans-serif', color: t.text }}>{s.value.toLocaleString()}</p>
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

          {/* Status */}
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle as React.CSSProperties}>
              <option value="all"      style={{ background: t.selectOptionBg }}>All Status</option>
              <option value="active"   style={{ background: t.selectOptionBg }}>Active</option>
              <option value="inactive" style={{ background: t.selectOptionBg }}>Inactive</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
          </div>

          {/* Plan */}
          <div className="relative">
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} style={selectStyle as React.CSSProperties}>
              <option value="all" style={{ background: t.selectOptionBg }}>All Plans</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id} style={{ background: t.selectOptionBg }}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
          </div>

          {/* Moderator */}
          <div className="relative">
            <select value={moderatorFilter} onChange={(e) => setModeratorFilter(e.target.value)} style={selectStyle as React.CSSProperties}>
              <option value="all" style={{ background: t.selectOptionBg }}>All Moderators</option>
              {moderatorsList.map((m) => (
                <option key={m._id} value={m._id} style={{ background: t.selectOptionBg }}>
                  {m.firstName} {m.lastName}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
          </div>

          <span className="text-xs ml-auto flex-shrink-0" style={{ color: t.textFaint }}>
            {total.toLocaleString()} users match
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={20} className="animate-spin" style={{ color: '#D4A843' }} />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  {['User', 'Email', 'Moderator', 'Plan', 'Status', 'Joined', 'Actions'].map((h) => (
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
                  const plan   = safePlan(user.plan?.name);

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
                      <td className="px-5 py-3.5 text-sm" style={{ color: t.textSub }}>
                        {user.moderator ? `${user.moderator.firstName} ${user.moderator.lastName}` : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        {plan ? <PlanLogo plan={plan} /> : <span className="text-xs" style={{ color: t.textFaint }}>—</span>}
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

                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: t.textMuted }}>
                      No users match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Pagination ── */}
      {total > 0 && (
        <div
          className="rounded-xl px-6 py-4"
          style={{ background: t.surface, border: `1px solid ${t.border}` }}
        >
          <div className="flex flex-wrap items-center gap-4">

            {/* Left: showing info */}
            <div>
              <p className="text-sm font-medium" style={{ color: t.text }}>
                Page {page} of {totalPages}
              </p>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>
                Showing {pageStart}–{pageEnd} of {total} user{total !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Center: page buttons */}
            <div className="flex items-center gap-2 mx-auto">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}`, color: t.textSub }}
              >
                <ChevronLeft size={15} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((num, i) =>
                  num === 0 ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-9 h-9 flex items-center justify-center text-sm"
                      style={{ color: t.textFaint }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-all"
                      style={{
                        background: num === page
                          ? 'linear-gradient(135deg, #D4A843, #B8882A)'
                          : t.surfaceHover,
                        color:      num === page ? '#000' : t.textSub,
                        fontWeight: num === page ? 700   : 500,
                        border:     `1px solid ${num === page ? 'transparent' : t.borderSub}`,
                        boxShadow:  num === page ? '0 2px 12px rgba(212,168,67,0.4)' : 'none',
                      }}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}`, color: t.textSub }}
              >
                <span>Next</span>
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Right: rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: t.textFaint }}>Rows per page:</span>
              <div className="relative">
                <select
                  value={perPage}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                  style={{
                    background:    t.inputBg,
                    border:        `1px solid ${t.inputBorder}`,
                    borderRadius:  '8px',
                    color:         t.inputText,
                    fontSize:      '13px',
                    outline:       'none',
                    appearance:    'none',
                    paddingLeft:   '12px',
                    paddingRight:  '28px',
                    paddingTop:    '7px',
                    paddingBottom: '7px',
                    cursor:        'pointer',
                  } as React.CSSProperties}
                >
                  {PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n} style={{ background: t.selectOptionBg }}>{n}</option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User detail modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '17px', fontWeight: 600 }}>User Details</h3>
              <button
                onClick={() => { setSelectedUser(null); setUserDetail(null); }}
                className="w-7 h-7 rounded-md flex items-center justify-center"
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
                <div className="px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: avatarColors[0] }}
                    >
                      <span className="text-xl font-bold text-white">{selectedUser.firstName?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: t.text }}>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </p>
                      <p className="text-sm" style={{ color: t.textMuted }}>{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {safePlan(userDetail?.plan?.name) && <PlanLogo plan={safePlan(userDetail?.plan?.name)!} size={20} />}
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: selectedUser.isActive ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                        color:      selectedUser.isActive ? '#4ade80' : t.textMuted,
                      }}
                    >
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs" style={{ color: t.textFaint }}>
                      Joined {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>

                {userDetail?.moderator && (
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={13} style={{ color: '#D4A843' }} />
                      <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: t.textFaint }}>
                        Assigned Moderator
                      </p>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)' }}
                        >
                          <span className="text-sm font-bold text-black">{userDetail.moderator.firstName?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: t.text }}>
                            {userDetail.moderator.firstName} {userDetail.moderator.lastName}
                          </p>
                          {safePlan(userDetail?.plan?.name) && <PlanLogo plan={safePlan(userDetail?.plan?.name)!} size={18} />}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          { icon: Mail,  label: 'Email', value: userDetail.moderator.email },
                          { icon: Phone, label: 'Phone', value: userDetail.moderator.phoneNumber || '—' },
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,168,67,0.1)' }}>
                              <Icon size={11} style={{ color: '#D4A843' }} />
                            </div>
                            <div>
                              <span className="text-[9px] uppercase tracking-wider" style={{ color: t.textFaint }}>{label}</span>
                              <p className="text-xs" style={{ color: t.textSub }}>{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="px-6 pb-6">
              <button
                onClick={() => { setSelectedUser(null); setUserDetail(null); }}
                className="w-full py-2.5 rounded-lg text-sm font-medium"
                style={{ background: t.surfaceHover, color: t.textSub, border: `1px solid ${t.borderSub}` }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}