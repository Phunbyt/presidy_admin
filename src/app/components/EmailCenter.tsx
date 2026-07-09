import { useState, useMemo, useEffect } from 'react';
import { Send, Mail, Users, Clock, CheckCircle2, Search, X, UserCheck, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { PlanLogo, Plan } from './PlanLogo';

const API_BASE = 'http://localhost:3000/api/v1';
const KNOWN_PLANS: Plan[] = ['Spotify', 'Apple Music', 'YouTube Music'];

function safePlan(name?: string | null): Plan | null {
  return name && KNOWN_PLANS.includes(name as Plan) ? (name as Plan) : null;
}

type Recipient = {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'moderator';
  status: 'Active' | 'Inactive';
  plan: Plan | null;
};

const avatarColors = [
  'linear-gradient(135deg, #D4A843, #B8882A)',
  'linear-gradient(135deg, #52A0E0, #2A5BB8)',
  'linear-gradient(135deg, #52C4A0, #2AB87E)',
  'linear-gradient(135deg, #E07852, #B84A2A)',
  'linear-gradient(135deg, #A052E0, #7030B8)',
  'linear-gradient(135deg, #E0D452, #B8A82A)',
];

function RecipientAvatar({ name, index }: { name: string; index: number }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: avatarColors[index % avatarColors.length] }}
    >
      <span className="text-[10px] font-bold text-white">{name.charAt(0)}</span>
    </div>
  );
}

export function EmailCenter() {
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  // Recipients (real data)
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);

  // Single email state
  const [singleEmail, setSingleEmail] = useState({ to: '', subject: '', message: '' });
  const [singleSending, setSingleSending] = useState(false);
  const [singleError, setSingleError] = useState('');
  const [singleSuccess, setSingleSuccess] = useState(false);

  // Bulk email state
  const [recipientSearch, setRecipientSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState(false);

  // ── load all users + moderators once, merge into one recipient list ──
  useEffect(() => {
    const fetchRecipients = async () => {
      setLoadingRecipients(true);
      try {
        const token = localStorage.getItem('admin_token');

        const [usersRes, modsRes] = await Promise.all([
          fetch(`${API_BASE}/user?limit=1000`,    { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE}/moderator?limit=1000`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const usersData = await usersRes.json();
        const modsData   = await modsRes.json();

        const userRecipients: Recipient[] = (usersData.data ?? [])
          .filter((u: any) => !u.isModerator)
          .map((u: any) => ({
            id: u._id,
            name: `${u.firstName} ${u.lastName}`,
            email: u.email,
            type: 'user' as const,
            status: u.isActive ? 'Active' as const : 'Inactive' as const,
            plan: safePlan(u.plan?.name),
          }));

        const modRecipients: Recipient[] = (modsData.data ?? []).map((m: any) => ({
          id: m._id,
          name: `${m.firstName} ${m.lastName}`,
          email: m.email,
          type: 'moderator' as const,
          status: m.isVerified ? 'Active' as const : 'Inactive' as const,
          plan: safePlan(m.plan?.name),
        }));

        setAllRecipients([...userRecipients, ...modRecipients]);
      } catch (err) {
        console.error('Failed to fetch recipients:', err);
      } finally {
        setLoadingRecipients(false);
      }
    };

    fetchRecipients();
  }, []);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: t.inputBg,
    border: `1px solid ${t.inputBorder}`,
    borderRadius: '8px',
    color: t.inputText,
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    color: t.textMuted,
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = t.inputBorderFocus;
    e.target.style.background = t.inputBgFocus;
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = t.inputBorder;
    e.target.style.background = t.inputBg;
  };

  // ── Single send ──
  const handleSingleSend = async () => {
    setSingleError('');
    setSingleSuccess(false);
    if (!singleEmail.to || !singleEmail.subject || !singleEmail.message) {
      setSingleError('Please fill in all fields before sending.');
      return;
    }

    setSingleSending(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/mail/single`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: singleEmail.to,
          subject: singleEmail.subject,
          message: singleEmail.message,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setSingleError(data.message || 'Failed to send: Could not connect to email service.');
        return;
      }

      setSingleSuccess(true);
      setSingleEmail({ to: '', subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setSingleError('Failed to send: Could not connect to the server.');
    } finally {
      setSingleSending(false);
    }
  };

  // ── Bulk recipient selection helpers ──
  const filteredRecipients = useMemo(() => {
    const q = recipientSearch.toLowerCase();
    if (!q) return allRecipients;
    return allRecipients.filter(
      (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [recipientSearch, allRecipients]);

  const toggleRecipient = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const quickSelect = (filter: (r: Recipient) => boolean) => {
    const ids = allRecipients.filter(filter).map((r) => r.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const selectedRecipients = allRecipients.filter((r) => selectedIds.has(r.id));

  const quickGroups = [
    { label: 'All Users',      filter: (r: Recipient) => r.type === 'user' },
    { label: 'All Moderators', filter: (r: Recipient) => r.type === 'moderator' },
    { label: 'Active Only',    filter: (r: Recipient) => r.status === 'Active' },
    { label: 'Spotify',       filter: (r: Recipient) => r.plan === 'Spotify' },
    { label: 'Apple Music',   filter: (r: Recipient) => r.plan === 'Apple Music' },
    { label: 'YouTube Music', filter: (r: Recipient) => r.plan === 'YouTube Music' },
    { label: 'Inactive',      filter: (r: Recipient) => r.status === 'Inactive' },
    { label: 'Select All',    filter: () => true },
  ];

  // ── Bulk send ──
  const handleBulkSend = async () => {
    setBulkError('');
    setBulkSuccess(false);
    if (selectedIds.size === 0) {
      setBulkError('Please select at least one recipient.');
      return;
    }
    if (!bulkSubject || !bulkMessage) {
      setBulkError('Please fill in the subject and message fields.');
      return;
    }

    setBulkSending(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/mail/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: bulkSubject,
          message: bulkMessage,
          userIds: Array.from(selectedIds),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setBulkError(data.message || 'Failed to send: Could not connect to email service.');
        return;
      }

      setBulkSuccess(true);
      setBulkSubject('');
      setBulkMessage('');
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      setBulkError('Failed to send: Could not connect to the server.');
    } finally {
      setBulkSending(false);
    }
  };

  const recentEmails = [
    { subject: 'Welcome to Presidy',           recipients: 'All Users',    sent: '2 hours ago', status: 'Delivered', opens: '—' },
    { subject: 'Moderator Payment Notice',     recipients: 'Moderators',   sent: '1 day ago',   status: 'Delivered', opens: '—' },
    { subject: 'Platform Update — June 2026',  recipients: 'Active Users', sent: '3 days ago',  status: 'Delivered', opens: '—' },
  ];

  return (
    <div className="p-8 space-y-6" style={{ background: t.bg, minHeight: '100%', transition: 'background 0.2s' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '22px', fontWeight: 700 }}>
          Email Center
        </h2>
        <p className="mt-1 text-sm" style={{ color: t.textMuted }}>
          Send individual or bulk emails to users and moderators
        </p>
      </div>

      {/* Compose card */}
      <div className="rounded-xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        {/* Tab bar */}
        <div className="flex" style={{ borderBottom: `1px solid ${t.border}` }}>
          {([
            { id: 'single' as const, label: 'Single Email', icon: Mail  },
            { id: 'bulk'   as const, label: 'Bulk Email',   icon: Users },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-6 py-4 transition-all relative"
                style={{ color: isActive ? '#D4A843' : t.textMuted }}
              >
                <Icon size={14} />
                <span className="text-sm font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: '#D4A843' }} />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* ── Single email ── */}
          {activeTab === 'single' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label style={labelStyle}>Recipient Email</label>
                <input
                  type="email"
                  value={singleEmail.to}
                  onChange={(e) => setSingleEmail({ ...singleEmail, to: e.target.value })}
                  placeholder="user@example.com"
                  style={{ ...inputStyle, padding: '10px 14px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <input
                  type="text"
                  value={singleEmail.subject}
                  onChange={(e) => setSingleEmail({ ...singleEmail, subject: e.target.value })}
                  placeholder="Email subject"
                  style={{ ...inputStyle, padding: '10px 14px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea
                  value={singleEmail.message}
                  onChange={(e) => setSingleEmail({ ...singleEmail, message: e.target.value })}
                  placeholder={'Write your message...\n\nTip: Use {name} to personalise the greeting.'}
                  rows={7}
                  style={{ ...inputStyle, padding: '10px 14px', resize: 'none' } as React.CSSProperties}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <p className="text-xs mt-1.5" style={{ color: t.textFaint }}>
                  Use{' '}
                  <code style={{ background: t.surfaceHover, padding: '1px 6px', borderRadius: '4px', color: '#D4A843' }}>
                    {'{name}'}
                  </code>{' '}
                  to insert the recipient's name
                </p>
              </div>

              {singleError && (
                <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={14} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                  <p className="text-xs leading-relaxed" style={{ color: '#f87171' }}>{singleError}</p>
                </div>
              )}
              {singleSuccess && (
                <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                  <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
                  <p className="text-xs" style={{ color: '#4ade80' }}>Email sent successfully.</p>
                </div>
              )}

              <button
                onClick={handleSingleSend}
                disabled={singleSending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)', color: '#000' }}
              >
                <Send size={14} />
                <span className="font-semibold text-sm">{singleSending ? 'Sending…' : 'Send Email'}</span>
              </button>
            </div>
          )}

          {/* ── Bulk email ── */}
          {activeTab === 'bulk' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* Left — recipient picker */}
              <div className="flex flex-col gap-4">
                <div>
                  <label style={labelStyle}>Select Recipients</label>

                  {loadingRecipients ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 size={18} className="animate-spin" style={{ color: '#D4A843' }} />
                    </div>
                  ) : (
                    <>
                      {/* Quick-select group buttons */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {quickGroups.map((g) => (
                          <button
                            key={g.label}
                            onClick={() => quickSelect(g.filter)}
                            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                            style={{
                              background: t.surfaceHover,
                              border: `1px solid ${t.borderSub}`,
                              color: t.textSub,
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,67,0.4)';
                              (e.currentTarget as HTMLElement).style.color = '#D4A843';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.borderColor = t.borderSub;
                              (e.currentTarget as HTMLElement).style.color = t.textSub;
                            }}
                          >
                            {g.label}
                          </button>
                        ))}
                        {selectedIds.size > 0 && (
                          <button
                            onClick={() => setSelectedIds(new Set())}
                            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Search */}
                      <div className="relative mb-2">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.textFaint }} />
                        <input
                          type="text"
                          placeholder="Search by name or email…"
                          value={recipientSearch}
                          onChange={(e) => setRecipientSearch(e.target.value)}
                          style={{ ...inputStyle, padding: '9px 14px 9px 34px' }}
                          onFocus={handleFocus}
                          onBlur={handleBlur}
                        />
                      </div>

                      {/* Category headers + list */}
                      <div
                        className="rounded-lg overflow-hidden overflow-y-auto"
                        style={{ border: `1px solid ${t.borderSub}`, maxHeight: '320px' }}
                      >
                        {/* Users section */}
                        {filteredRecipients.some((r) => r.type === 'user') && (
                          <>
                            <div
                              className="flex items-center gap-2 px-3 py-2 sticky top-0"
                              style={{ background: t.surfaceAlt, borderBottom: `1px solid ${t.borderSub}` }}
                            >
                              <UserCheck size={11} style={{ color: '#52A0E0' }} />
                              <span className="text-[10px] font-semibold tracking-wider" style={{ color: t.textFaint }}>
                                USERS
                              </span>
                              <span className="ml-auto text-[10px]" style={{ color: t.textFaint }}>
                                {allRecipients.filter((r) => r.type === 'user' && selectedIds.has(r.id)).length}/
                                {allRecipients.filter((r) => r.type === 'user').length} selected
                              </span>
                            </div>
                            {filteredRecipients.filter((r) => r.type === 'user').map((r, i) => (
                              <RecipientRow
                                key={r.id}
                                recipient={r}
                                index={i}
                                selected={selectedIds.has(r.id)}
                                onToggle={() => toggleRecipient(r.id)}
                                t={t}
                              />
                            ))}
                          </>
                        )}

                        {/* Moderators section */}
                        {filteredRecipients.some((r) => r.type === 'moderator') && (
                          <>
                            <div
                              className="flex items-center gap-2 px-3 py-2 sticky top-0"
                              style={{ background: t.surfaceAlt, borderBottom: `1px solid ${t.borderSub}`, borderTop: filteredRecipients.some((r) => r.type === 'user') ? `1px solid ${t.border}` : 'none' }}
                            >
                              <ShieldCheck size={11} style={{ color: '#D4A843' }} />
                              <span className="text-[10px] font-semibold tracking-wider" style={{ color: t.textFaint }}>
                                MODERATORS
                              </span>
                              <span className="ml-auto text-[10px]" style={{ color: t.textFaint }}>
                                {allRecipients.filter((r) => r.type === 'moderator' && selectedIds.has(r.id)).length}/
                                {allRecipients.filter((r) => r.type === 'moderator').length} selected
                              </span>
                            </div>
                            {filteredRecipients.filter((r) => r.type === 'moderator').map((r, i) => (
                              <RecipientRow
                                key={r.id}
                                recipient={r}
                                index={i}
                                selected={selectedIds.has(r.id)}
                                onToggle={() => toggleRecipient(r.id)}
                                t={t}
                              />
                            ))}
                          </>
                        )}

                        {filteredRecipients.length === 0 && (
                          <div className="py-8 text-center">
                            <p className="text-sm" style={{ color: t.textMuted }}>No results for "{recipientSearch}"</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Selected chips */}
                {selectedRecipients.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: t.textMuted }}>
                        {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5" style={{ maxHeight: '100px', overflowY: 'auto' }}>
                      {selectedRecipients.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-full text-xs"
                          style={{
                            background: r.type === 'moderator' ? 'rgba(212,168,67,0.1)' : 'rgba(82,160,224,0.1)',
                            border: `1px solid ${r.type === 'moderator' ? 'rgba(212,168,67,0.25)' : 'rgba(82,160,224,0.25)'}`,
                            color: r.type === 'moderator' ? '#D4A843' : '#52A0E0',
                          }}
                        >
                          <span>{r.name}</span>
                          <button
                            onClick={() => toggleRecipient(r.id)}
                            className="flex items-center justify-center w-3.5 h-3.5 rounded-full transition-opacity hover:opacity-70"
                          >
                            <X size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right — compose */}
              <div className="flex flex-col gap-4">
                <div>
                  <label style={labelStyle}>Subject</label>
                  <input
                    type="text"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    placeholder="Email subject"
                    style={{ ...inputStyle, padding: '10px 14px' }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div className="flex-1">
                  <label style={labelStyle}>Message</label>
                  <textarea
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    placeholder={'Write your message here…\n\nHi {name},\n\nUse {name} to personalise with the recipient\'s first name.'}
                    rows={10}
                    style={{ ...inputStyle, padding: '10px 14px', resize: 'none' } as React.CSSProperties}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <p className="text-xs mt-1.5" style={{ color: t.textFaint }}>
                    Use{' '}
                    <code style={{ background: t.surfaceHover, padding: '1px 6px', borderRadius: '4px', color: '#D4A843' }}>
                      {'{name}'}
                    </code>{' '}
                    to personalise each email with the recipient's name
                  </p>
                </div>

                {bulkError && (
                  <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={14} style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#f87171' }}>{bulkError}</p>
                  </div>
                )}
                {bulkSuccess && (
                  <div className="flex items-center gap-2.5 px-3 py-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
                    <CheckCircle2 size={14} style={{ color: '#4ade80' }} />
                    <p className="text-xs" style={{ color: '#4ade80' }}>Bulk email queued for {selectedRecipients.length} recipient{selectedRecipients.length !== 1 ? 's' : ''}.</p>
                  </div>
                )}

                <button
                  onClick={handleBulkSend}
                  disabled={bulkSending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all disabled:opacity-60 self-start"
                  style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)', color: '#000' }}
                >
                  <Send size={14} />
                  <span className="font-semibold text-sm">
                    {bulkSending
                      ? 'Sending…'
                      : selectedIds.size > 0
                      ? `Send to ${selectedIds.size} Recipient${selectedIds.size !== 1 ? 's' : ''}`
                      : 'Send Bulk Email'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent emails */}
      <div className="rounded-xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
          <h3 className="text-sm font-semibold" style={{ color: t.text }}>Recent Emails</h3>
        </div>
        <div>
          {recentEmails.map((email, index) => (
            <div
              key={email.subject}
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: index < recentEmails.length - 1 ? `1px solid ${t.borderSub}` : 'none' }}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(212,168,67,0.1)' }}
                >
                  <Mail size={13} style={{ color: '#D4A843' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: t.text }}>{email.subject}</p>
                  <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>To: {email.recipients}</p>
                </div>
              </div>
              <div className="text-right ml-6 flex-shrink-0">
                <div className="flex items-center gap-1.5 justify-end mb-1">
                  <Clock size={10} style={{ color: t.textFaint }} />
                  <span className="text-xs" style={{ color: t.textFaint }}>{email.sent}</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs" style={{ color: t.textMuted }}>{email.opens} opens</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,222,128,0.1)' }}>
                    <CheckCircle2 size={10} style={{ color: '#4ade80' }} />
                    <span className="text-xs font-medium" style={{ color: '#4ade80' }}>{email.status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RecipientRow({
  recipient,
  index,
  selected,
  onToggle,
  t,
}: {
  recipient: Recipient;
  index: number;
  selected: boolean;
  onToggle: () => void;
  t: any;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 px-3 py-2.5 transition-all text-left"
      style={{
        background: selected
          ? recipient.type === 'moderator'
            ? 'rgba(212,168,67,0.06)'
            : 'rgba(82,160,224,0.06)'
          : 'transparent',
        borderBottom: `1px solid ${t.borderSub}`,
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        style={{ accentColor: recipient.type === 'moderator' ? '#D4A843' : '#52A0E0', cursor: 'pointer', flexShrink: 0 }}
      />
      <RecipientAvatar name={recipient.name} index={index} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate" style={{ color: t.text }}>{recipient.name}</p>
        <p className="text-[10px] truncate" style={{ color: t.textMuted }}>{recipient.email}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span
          className="px-1.5 py-0.5 rounded text-[9px] font-medium"
          style={{
            background: recipient.status === 'Active' ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
            color: recipient.status === 'Active' ? '#4ade80' : t.textMuted,
          }}
        >
          {recipient.status}
        </span>
        {recipient.plan && <PlanLogo plan={recipient.plan} size={16} />}
      </div>
    </button>
  );
}