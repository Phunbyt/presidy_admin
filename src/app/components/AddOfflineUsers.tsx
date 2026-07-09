import { useState, useEffect } from 'react';
import { X, UserPlus, Phone, Mail, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { PlanLogo, Plan } from './PlanLogo';

const API_BASE = 'http://localhost:3000/api/v1';
const KNOWN_PLANS: Plan[] = ['Spotify', 'Apple Music', 'YouTube Music'];
const DEFAULT_FAMILY_LIMIT = 5;

function safePlan(name?: string | null): Plan | null {
  return name && KNOWN_PLANS.includes(name as Plan) ? (name as Plan) : null;
}

const avatarColors = [
  'linear-gradient(135deg, #D4A843, #B8882A)',
  'linear-gradient(135deg, #52A0E0, #2A5BB8)',
  'linear-gradient(135deg, #52C4A0, #2AB87E)',
  'linear-gradient(135deg, #E07852, #B84A2A)',
  'linear-gradient(135deg, #A052E0, #7030B8)',
  'linear-gradient(135deg, #E0D452, #B8A82A)',
];

function FamilyDots({ count, max }: { count: number; max: number }) {
  const full    = count >= max;
  const warning = count === max - 1;
  const color   = full ? '#f87171' : warning ? '#D4A843' : '#4ade80';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: i < count ? color : 'rgba(128,128,128,0.2)' }} />
      ))}
    </div>
  );
}

export function AddOfflineUsers() {
  const { t } = useTheme();

  const [moderators, setModerators] = useState<any[]>([]);
  const [loading, setLoading]       = useState(false);
  const [plans, setPlans]           = useState<any[]>([]);

  const [planFilter, setPlanFilter] = useState<string>('all'); // 'all' | plan name

  const [addingTo, setAddingTo]     = useState<any | null>(null);
  const [form, setForm]             = useState({ name: '', phone: '', email: '' });
  const [formError, setFormError]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [addedName, setAddedName]   = useState('');

  const fetchModerators = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res   = await fetch(`${API_BASE}/moderator?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data  = await res.json();
      setModerators(data.data ?? []);
    } catch (err) {
      console.error('Failed to fetch moderators:', err);
    } finally {
      setLoading(false);
    }
  };

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
    fetchModerators();
  }, []);

  const planNames = plans.map((p) => p.name).filter((n) => safePlan(n));

  const filtered = planFilter === 'all'
    ? moderators
    : moderators.filter((m) => m.plan?.name === planFilter);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: '8px',
    color: t.inputText,
    fontSize: '13px',
    outline: 'none',
    padding: '10px 14px',
    transition: 'border-color 0.15s',
  };

  const handleAddMember = async () => {
    setFormError('');

    if (!form.name.trim())  { setFormError('Full name is required.'); return; }
    if (!form.phone.trim()) { setFormError('Phone number is required.'); return; }
    if (!addingTo) return;

    const limit = addingTo.familyMembersLimit ?? DEFAULT_FAMILY_LIMIT;
    if ((addingTo.userCount ?? 0) >= limit) {
      setFormError('This family is already full.');
      return;
    }

    const [firstName, ...rest] = form.name.trim().split(' ');
    const lastName  = rest.join(' ') || '';
    const email     = form.email.trim() || `${firstName.toLowerCase()}.${lastName.toLowerCase() || 'user'}.${Date.now()}@presidy.offline`;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res   = await fetch(`${API_BASE}/users/offline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber: form.phone.trim(),
          moderatorId: addingTo._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || 'Failed to add member. Please try again.');
        return;
      }

      setAddedName(form.name.trim());
      setForm({ name: '', phone: '', email: '' });
      setAddingTo(null);
      setTimeout(() => setAddedName(''), 3500);

      // refresh family rosters so counts/cards reflect the new member
      fetchModerators();
    } catch (err) {
      console.error(err);
      setFormError('Failed to connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const planCounts = planNames.map((plan) => {
    const planMods = moderators.filter((m) => m.plan?.name === plan);
    return {
      plan,
      mods: planMods,
      members: planMods.reduce((s, m) => s + (m.userCount ?? 0), 0),
      full: planMods.filter((m) => (m.userCount ?? 0) >= (m.familyMembersLimit ?? DEFAULT_FAMILY_LIMIT)).length,
    };
  });

  return (
    <div className="p-8 space-y-6" style={{ background: t.bg, minHeight: '100%', transition: 'background 0.2s' }}>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '22px', fontWeight: 700 }}>
            Offline Users
          </h2>
          <p className="mt-1 text-sm" style={{ color: t.textMuted }}>
            View all moderator families and add offline members directly to a plan
          </p>
        </div>
        {addedName && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
            <span className="text-sm font-medium" style={{ color: '#4ade80' }}>{addedName} added successfully</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="animate-spin" style={{ color: '#D4A843' }} />
        </div>
      ) : (
        <>
          {/* Plan summary cards (clickable filter) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {planCounts.map(({ plan, mods: planMods, members, full }) => {
              const planLogo = safePlan(plan);
              return (
                <button
                  key={plan}
                  onClick={() => setPlanFilter(planFilter === plan ? 'all' : plan)}
                  className="rounded-xl p-5 text-left transition-all"
                  style={{
                    background: planFilter === plan ? t.surfaceAlt : t.surface,
                    border: `1px solid ${planFilter === plan ? 'rgba(212,168,67,0.35)' : t.border}`,
                    outline: 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    {planLogo && <PlanLogo plan={planLogo} size={28} />}
                    {planFilter === plan && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843' }}>
                        Active filter
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-bold" style={{ fontFamily: 'Syne, sans-serif', color: t.text }}>
                    {members} member{members !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>
                    {planMods.length} moderators · {full} full famil{full === 1 ? 'y' : 'ies'}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: t.textFaint }}>Filter:</span>
            {['all', ...planNames].map((p) => {
              const planLogo = safePlan(p);
              return (
                <button
                  key={p}
                  onClick={() => setPlanFilter(p)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: planFilter === p ? 'rgba(212,168,67,0.12)' : t.surfaceHover,
                    color:      planFilter === p ? '#D4A843' : t.textMuted,
                    border:     `1px solid ${planFilter === p ? 'rgba(212,168,67,0.3)' : t.borderSub}`,
                  }}
                >
                  {planLogo && <PlanLogo plan={planLogo} size={12} />}
                  <span>{p === 'all' ? 'All Plans' : p}</span>
                </button>
              );
            })}
            <span className="ml-auto text-xs" style={{ color: t.textFaint }}>
              {filtered.length} of {moderators.length} moderators
            </span>
          </div>

          {/* Moderator cards grouped by plan */}
          {(planFilter === 'all' ? planNames : [planFilter]).map((plan) => {
            const planMods = filtered.filter((m) => m.plan?.name === plan);
            if (planMods.length === 0) return null;
            const planLogo = safePlan(plan);

            return (
              <div key={plan}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-4">
                  {planLogo && <PlanLogo plan={planLogo} size={22} />}
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: '15px', color: t.text }}>{plan}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: t.surfaceHover, color: t.textMuted }}>
                    {planMods.length} moderator{planMods.length !== 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 h-px ml-1" style={{ background: t.borderSub }} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {planMods.map((mod, modIndex) => {
                    const count = mod.userCount ?? 0;
                    const limit = mod.familyMembersLimit ?? DEFAULT_FAMILY_LIMIT;
                    const full  = count >= limit;
                    const name  = `${mod.firstName} ${mod.lastName}`;
                    const status = mod.isVerified ? 'Active' : 'Inactive';

                    return (
                      <div
                        key={mod._id}
                        className="rounded-xl overflow-hidden"
                        style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}
                      >
                        {/* Card header */}
                        <div className="px-5 pt-5 pb-4" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                          <div className="flex items-start gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                              style={{ background: avatarColors[modIndex % avatarColors.length] }}
                            >
                              {name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate" style={{ color: t.text }}>{name}</p>
                              <p className="text-xs truncate" style={{ color: t.textMuted }}>{mod.email}</p>
                              <p className="text-xs mt-0.5" style={{ color: t.textFaint }}>{mod.phoneNumber || '—'}</p>
                            </div>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{
                                background: status === 'Active' ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                                color: status === 'Active' ? '#4ade80' : t.textMuted,
                              }}
                            >
                              {status}
                            </span>
                          </div>

                          {/* Capacity row */}
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FamilyDots count={count} max={limit} />
                              <span
                                className="text-xs font-semibold"
                                style={{ color: full ? '#f87171' : count >= limit - 1 ? '#D4A843' : t.textSub }}
                              >
                                {count}/{limit}{full ? ' · Full' : ''}
                              </span>
                            </div>
                            <button
                              onClick={() => { setAddingTo(mod); setForm({ name: '', phone: '', email: '' }); setFormError(''); }}
                              disabled={full || status === 'Inactive'}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{
                                background: full ? t.surfaceHover : 'rgba(212,168,67,0.12)',
                                color:      full ? t.textMuted    : '#D4A843',
                                border:     `1px solid ${full ? t.borderSub : 'rgba(212,168,67,0.25)'}`,
                              }}
                            >
                              <UserPlus size={11} />
                              <span>{full ? 'Full' : 'Add Member'}</span>
                            </button>
                          </div>
                        </div>

                        {/* Family member list */}
                        <div className="px-5 py-3">
                          {count === 0 ? (
                            <p className="text-xs text-center py-3" style={{ color: t.textFaint }}>No members yet — family is open</p>
                          ) : (
                            <div className="space-y-1">
                              {(mod.users ?? []).map((user: any, i: number) => (
                                <div key={user._id ?? i} className="flex items-center gap-2.5 py-1.5">
                                  <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                                    style={{ background: avatarColors[(modIndex + i + 1) % avatarColors.length] }}
                                  >
                                    {user.firstName?.charAt(0)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium truncate" style={{ color: t.text }}>
                                      {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-[10px] truncate" style={{ color: t.textMuted }}>{user.phoneNumber || user.email}</p>
                                  </div>
                                  <span
                                    className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                                    style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
                                  >
                                    Active
                                  </span>
                                </div>
                              ))}
                              {Array.from({ length: limit - count }).map((_, i) => (
                                <div key={`empty-${i}`} className="flex items-center gap-2.5 py-1.5">
                                  <div
                                    className="w-6 h-6 rounded-full flex-shrink-0 border border-dashed"
                                    style={{ borderColor: t.borderSub }}
                                  />
                                  <p className="text-[10px]" style={{ color: t.textFaint }}>Open slot</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Add member modal */}
      {addingTo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{ background: t.surface, border: `1px solid ${t.border}`, boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '16px', fontWeight: 600 }}>
                  Add to Family
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {safePlan(addingTo.plan?.name) && <PlanLogo plan={safePlan(addingTo.plan?.name)!} size={14} />}
                  <span className="text-xs" style={{ color: t.textMuted }}>
                    {addingTo.firstName} {addingTo.lastName} · {addingTo.userCount ?? 0}/{addingTo.familyMembersLimit ?? DEFAULT_FAMILY_LIMIT} members
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAddingTo(null)}
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ color: t.textMuted, background: t.surfaceHover }}
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>
                  <User size={10} /> Full Name <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = t.inputBorderFocus; }}
                  onBlur={(e)  => { e.target.style.borderColor = t.inputBorder; }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>
                  <Phone size={10} /> Phone Number <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = t.inputBorderFocus; }}
                  onBlur={(e)  => { e.target.style.borderColor = t.inputBorder; }}
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: t.textMuted }}>
                  <Mail size={10} /> Email
                  <span className="normal-case font-normal text-[10px]" style={{ color: t.textFaint }}>(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = t.inputBorderFocus; }}
                  onBlur={(e)  => { e.target.style.borderColor = t.inputBorder; }}
                />
              </div>

              {formError && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={13} style={{ color: '#f87171', flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: '#f87171' }}>{formError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setAddingTo(null)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                  style={{ background: t.surfaceHover, color: t.textSub, border: `1px solid ${t.borderSub}` }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)', color: '#000' }}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                  <span>{submitting ? 'Adding…' : 'Add Member'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}