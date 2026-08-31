import { useState, useEffect } from 'react';
import { Search, ChevronDown, X, CreditCard, Phone, Mail, Calendar, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { PlanLogo, Plan } from './PlanLogo';
const unwrap = (res: any) => res?.data ?? res;
const API_BASE = 'http://localhost:3000/api/v1';
const KNOWN_PLANS: Plan[] = ['Spotify', 'Apple Music', 'YouTube Music'];
const DEFAULT_FAMILY_LIMIT = 5;

function safePlan(name?: string | null): Plan | null {
  return name && KNOWN_PLANS.includes(name as Plan) ? (name as Plan) : null;
}

// Builds a wa.me link from a raw phone number.
// Strips everything but digits, then normalizes Nigerian local numbers
// (e.g. "08012345678" -> "2348012345678") since wa.me needs the full country code.
function toWhatsAppLink(phone?: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return null;

  const withCountryCode = digits.startsWith('0')
    ? `234${digits.slice(1)}`   // local format -> country code
    : digits;                   // already has a country code

  return `https://wa.me/${withCountryCode}`;
}

// lucide-react has no WhatsApp glyph (it only ships generic icons), so this is
// a minimal inline SVG of the WhatsApp mark, sized/colored like any other icon here.
function WhatsAppIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#4ade80" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.44 5.14L2 22l5.09-1.53a9.87 9.87 0 0 0 4.95 1.34h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm0 18.1h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.02.91.9-2.94-.2-.31a8.2 8.2 0 0 1-1.26-4.42c0-4.53 3.69-8.22 8.23-8.22 2.2 0 4.26.86 5.81 2.41a8.16 8.16 0 0 1 2.41 5.81c0 4.53-3.69 8.22-8.22 8.22Zm4.5-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.78.97-.15.16-.29.18-.54.06-1.45-.72-2.4-1.29-3.36-2.92-.25-.44.25-.41.72-1.36.08-.16.04-.3-.04-.42-.08-.12-.51-1.23-.7-1.69-.19-.44-.38-.38-.52-.39h-.44c-.15 0-.39.06-.6.3-.2.25-.79.77-.79 1.87s.81 2.16 .92 2.31c.12.16 1.6 2.44 3.89 3.33 1.93.75 2.32.6 2.74.56.42-.04 1.36-.56 1.55-1.1.19-.55.19-1.02.13-1.11-.06-.1-.23-.16-.48-.28Z"/>
    </svg>
  );
}

const avatarColors = [
  'linear-gradient(135deg, #D4A843, #B8882A)',
  'linear-gradient(135deg, #52A0E0, #2A5BB8)',
  'linear-gradient(135deg, #52C4A0, #2AB87E)',
  'linear-gradient(135deg, #E07852, #B84A2A)',
  'linear-gradient(135deg, #A052E0, #7030B8)',
  'linear-gradient(135deg, #E0D452, #B8A82A)',
];

const fmt = (n: number) => `₦${n.toLocaleString()}`;

function FamilyCount({ count, max }: { count: number; max: number }) {
  const full    = count >= max;
  const warning = count === max - 1;
  const color   = full ? '#f87171' : warning ? '#D4A843' : '#4ade80';

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold" style={{ color }}>
        {count}/{max}
      </span>
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ background: i < count ? color : 'rgba(255,255,255,0.12)' }}
          />
        ))}
      </div>
      {full && (
        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: '#f87171' }}>
          Full
        </span>
      )}
    </div>
  );
}

export function Moderators() {
  const { t } = useTheme();

  const [moderators, setModerators]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [total, setTotal]               = useState(0);

  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter]     = useState('all');

  const [plans, setPlans] = useState<any[]>([]);

  const [selectedMod, setSelectedMod]   = useState<any | null>(null);
  const [modDetail, setModDetail]       = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const res   = await fetch(`${API_BASE}/plan/plans`, { headers: { Authorization: `Bearer ${token}` } });
        const data  = await res.json();
        setPlans(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error('Failed to fetch plans:', err);
        setPlans([]);
      }
    };
    fetchPlans();
  }, []);

  const fetchModerators = async () => {
    setLoading(true);
    try {
      const token  = localStorage.getItem('admin_token');
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') {
        params.append('isVerified', statusFilter === 'active' ? 'true' : 'false');
      }
      if (planFilter !== 'all') params.append('planId', planFilter);

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
  

  useEffect(() => {
    fetchModerators();
  }, [searchTerm, statusFilter, planFilter]);


const fetchModeratorDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res   = await fetch(`${API_BASE}/moderator/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw  = await res.json();
      
      // FIX: Extract the nested 'data' object
      const actualData = raw.data ?? raw;
      setModDetail(actualData);
      
    } catch (err) {
      console.error('Failed to fetch moderator detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };
  const handleViewMod = (mod: any) => {
    setSelectedMod(mod);
    fetchModeratorDetail(mod._id);
  };

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

  const totalMembers = moderators.reduce((s, m) => s + (m.userCount ?? 0), 0);
  const fullFamilies = moderators.filter(
    (m) => (m.userCount ?? 0) >= (m.familyMembersLimit ?? DEFAULT_FAMILY_LIMIT)
  ).length;

  return (
    <div className="p-8 space-y-6" style={{ background: t.bg, minHeight: '100%', transition: 'background 0.2s' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '22px', fontWeight: 700 }}>
          Moderator Management
        </h2>
        <p className="mt-1 text-sm" style={{ color: t.textMuted }}>
          Each moderator manages a family of subscribers under their plan
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Moderators', value: total },
          { label: 'Active',           value: moderators.filter((m) => m.isVerified).length },
          { label: 'Total Members',    value: totalMembers },
          { label: 'Full Families',    value: fullFamilies },
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

          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle as React.CSSProperties}>
              <option value="all"      style={{ background: t.selectOptionBg }}>All Status</option>
              <option value="active"   style={{ background: t.selectOptionBg }}>Active</option>
              <option value="inactive" style={{ background: t.selectOptionBg }}>Inactive</option>
            </select>
            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
          </div>

          <div className="relative">
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} style={selectStyle as React.CSSProperties}>
              <option value="all" style={{ background: t.selectOptionBg }}>All Plans</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id} style={{ background: t.selectOptionBg }}>{p.name}</option>
              ))}
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
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  {['Moderator', 'Phone', 'Plan', 'Family', 'Status', 'Total Earned', 'Joined', 'Actions'].map((h) => (
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
                  const plan   = safePlan(mod.plan?.name);
                  const limit  = mod.familyMembersLimit ?? DEFAULT_FAMILY_LIMIT;

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
                      <td className="px-5 py-3.5 text-xs" style={{ color: t.textSub }}>
                        {mod.phoneNumber ? (
                          <a
                            href={toWhatsAppLink(mod.phoneNumber)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 hover:underline"
                            style={{ color: t.textSub }}
                            title="Message on WhatsApp"
                          >
                            <WhatsAppIcon size={14} />
                            {mod.phoneNumber}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        {plan ? <PlanLogo plan={plan} /> : <span className="text-xs" style={{ color: t.textFaint }}>—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <FamilyCount count={mod.userCount ?? 0} max={limit} />
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
                        <span className="text-sm font-semibold" style={{ color: '#D4A843' }}>{fmt(mod.totalEarned ?? 0)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: t.textMuted }}>{joined}</td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleViewMod(mod)}
                          className="text-xs font-medium transition-opacity hover:opacity-70"
                          style={{ color: '#D4A843' }}
                        >
                          View Family
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {!loading && moderators.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: t.textMuted }}>
                      No moderators match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Moderator detail modal */}
      {selectedMod && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-0">
              <h3 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '17px', fontWeight: 600 }}>
                Moderator Profile
              </h3>
              <button
                onClick={() => { setSelectedMod(null); setModDetail(null); }}
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
                {/* Identity */}
                <div className="px-6 pt-5 pb-5" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: avatarColors[0] }}
                    >
                      <span className="text-2xl font-bold text-white">{selectedMod.firstName?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-base" style={{ color: t.text }}>
                          {selectedMod.firstName} {selectedMod.lastName}
                        </p>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: selectedMod.isVerified ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                            color:      selectedMod.isVerified ? '#4ade80' : t.textMuted,
                          }}
                        >
                          {selectedMod.isVerified ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {safePlan((modDetail?.plan ?? selectedMod.plan)?.name) && (
                        <PlanLogo plan={safePlan((modDetail?.plan ?? selectedMod.plan)?.name)!} size={20} />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {[
                      { icon: Mail,     label: 'Email',  value: selectedMod.email },
                      { icon: Phone,    label: 'Phone',  value: selectedMod.phoneNumber || '—' },
                      { icon: Calendar, label: 'Joined', value: selectedMod.createdAt ? new Date(selectedMod.createdAt).toLocaleDateString() : '—' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,168,67,0.1)' }}>
                          <Icon size={12} style={{ color: '#D4A843' }} />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider" style={{ color: t.textFaint }}>{label}</span>
                          {label === 'Phone' && selectedMod.phoneNumber ? (
                            <a
                              href={toWhatsAppLink(selectedMod.phoneNumber)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium hover:underline flex items-center gap-1.5"
                              style={{ color: t.textSub }}
                              title="Message on WhatsApp"
                            >
                              <WhatsAppIcon size={13} />
                              {value}
                            </a>
                          ) : (
                            <p className="text-xs font-medium" style={{ color: t.textSub }}>{value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Earnings */}
                <div className="px-6 py-4" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                  <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}>
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.1)' }}>
                      <CreditCard size={14} style={{ color: '#D4A843' }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: t.text }}>{fmt(modDetail?.totalEarned ?? selectedMod.totalEarned ?? 0)}</p>
                      <p className="text-[10px]" style={{ color: t.textMuted }}>Total Earned</p>
                    </div>
                  </div>
                </div>

                {/* Family */}
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: t.textFaint }}>
                      Family Members
                    </p>
                    <FamilyCount
                      count={modDetail?.userCount ?? 0}
                      max={modDetail?.familyMembersLimit ?? selectedMod.familyMembersLimit ?? DEFAULT_FAMILY_LIMIT}
                    />
                  </div>
                  <div className="space-y-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {(modDetail?.users ?? []).map((user: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                        style={{ background: t.surfaceHover, border: `1px solid ${t.borderSub}` }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.18)' }}>
                            <span className="text-[10px] font-bold" style={{ color: '#D4A843' }}>{user.firstName?.charAt(0)}</span>
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
                            background: user.isActive ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                            color:      user.isActive ? '#4ade80' : t.textMuted,
                          }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}

                    {(!modDetail?.users || modDetail.users.length === 0) && (
                      <p className="text-xs text-center py-4" style={{ color: t.textMuted }}>No family members yet.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="px-6 pb-6">
              <button
                onClick={() => { setSelectedMod(null); setModDetail(null); }}
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