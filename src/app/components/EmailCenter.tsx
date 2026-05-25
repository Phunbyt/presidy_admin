import { useState } from 'react';
import { Send, Mail, Users, Clock, CheckCircle2, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function EmailCenter() {
  const { t } = useTheme();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [singleEmail, setSingleEmail] = useState({ to: '', subject: '', message: '' });
  const [bulkEmail, setBulkEmail] = useState({ subject: '', message: '', segment: 'all' });
  const [sending, setSending] = useState(false);

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

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = t.inputBorderFocus;
    e.target.style.background = t.inputBgFocus;
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = t.inputBorder;
    e.target.style.background = t.inputBg;
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      alert('Email functionality will be enabled after Supabase connection');
    }, 800);
  };

  const recentEmails = [
    { subject: 'Welcome to Presidy',              recipients: 'All Users (12,458)',    sent: '2 hours ago', status: 'Delivered', opens: '3,421' },
    { subject: 'Moderator Payment Notice',        recipients: 'Moderators (342)',      sent: '1 day ago',   status: 'Delivered', opens: '287'   },
    { subject: 'Platform Update — April 2026',    recipients: 'Active Users (9,230)',  sent: '3 days ago',  status: 'Delivered', opens: '2,100' },
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6" style={{ background: t.bg, minHeight: '100%', transition: 'background 0.2s' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: 'clamp(18px, 5vw, 22px)', fontWeight: 700 }}>
          Email Center
        </h2>
        <p className="mt-1 text-xs sm:text-sm" style={{ color: t.textMuted }}>
          Send individual or bulk emails to users and moderators
        </p>
      </div>

      {/* Compose card */}
      <div className="rounded-lg sm:rounded-xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        {/* Tab bar */}
        <div className="flex overflow-x-auto" style={{ borderBottom: `1px solid ${t.border}` }}>
          {[
            { id: 'single' as const, label: 'Single Email', icon: Mail },
            { id: 'bulk'   as const, label: 'Bulk Email',   icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-3 sm:px-6 py-3 sm:py-4 transition-all relative whitespace-nowrap text-sm"
                style={{ color: isActive ? '#D4A843' : t.textMuted, fontSize: 'clamp(12px, 2vw, 14px)' }}
              >
                <Icon size={14} />
                <span className="font-medium hidden sm:inline">{tab.label}</span>
                <span className="font-medium sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t" style={{ background: '#D4A843' }} />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'single' ? (
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
                  placeholder="Write your message..."
                  rows={5}
                  style={{ ...inputStyle, padding: '10px 14px', resize: 'none' } as React.CSSProperties}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all disabled:opacity-60 font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)', color: '#000' }}
              >
                <Send size={14} />
                <span>{sending ? 'Sending...' : 'Send Email'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label style={labelStyle}>Recipient Segment</label>
                <div className="relative">
                  <select
                    value={bulkEmail.segment}
                    onChange={(e) => setBulkEmail({ ...bulkEmail, segment: e.target.value })}
                    style={{ ...inputStyle, padding: '10px 36px 10px 14px', appearance: 'none', cursor: 'pointer' } as React.CSSProperties}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="all"        style={{ background: t.selectOptionBg }}>All Users (12,458)</option>
                    <option value="users"      style={{ background: t.selectOptionBg }}>Users Only (12,116)</option>
                    <option value="moderators" style={{ background: t.selectOptionBg }}>Moderators Only (342)</option>
                    <option value="active"     style={{ background: t.selectOptionBg }}>Active Users (9,230)</option>
                    <option value="inactive"   style={{ background: t.selectOptionBg }}>Inactive Users (3,228)</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMuted }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <input
                  type="text"
                  value={bulkEmail.subject}
                  onChange={(e) => setBulkEmail({ ...bulkEmail, subject: e.target.value })}
                  placeholder="Email subject"
                  style={{ ...inputStyle, padding: '10px 14px' }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div>
                <label style={labelStyle}>Message</label>
                <textarea
                  value={bulkEmail.message}
                  onChange={(e) => setBulkEmail({ ...bulkEmail, message: e.target.value })}
                  placeholder="Write your message... Use {{name}} for personalization"
                  rows={5}
                  style={{ ...inputStyle, padding: '10px 14px', resize: 'none' } as React.CSSProperties}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <p className="text-xs mt-2" style={{ color: t.textFaint }}>
                  Tip: Use{' '}
                  <code style={{ background: t.surfaceHover, padding: '1px 5px', borderRadius: '3px', color: '#D4A843' }}>
                    {'{{name}}'}
                  </code>{' '}
                  for personalization
                </p>
              </div>
              <button
                onClick={handleSend}
                disabled={sending}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg transition-all disabled:opacity-60 font-semibold text-sm"
                style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)', color: '#000' }}
              >
                <Send size={14} />
                <span className="font-semibold text-sm">{sending ? 'Sending...' : 'Send Bulk Email'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent emails */}
      <div className="rounded-lg sm:rounded-xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        <div className="px-3 sm:px-5 py-3 sm:py-4" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
          <h3 className="text-sm font-semibold" style={{ color: t.text }}>Recent Emails</h3>
        </div>
        <div>
          {recentEmails.map((email, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-3 sm:px-5 py-3 sm:py-4"
              style={{ borderBottom: index < recentEmails.length - 1 ? `1px solid ${t.borderSub}` : 'none' }}
            >
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(212,168,67,0.1)' }}>
                  <Mail size={13} style={{ color: '#D4A843' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate" style={{ color: t.text }}>{email.subject}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: t.textMuted }}>To: {email.recipients}</p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Clock size={10} style={{ color: t.textFaint }} />
                  <span className="text-xs" style={{ color: t.textFaint }}>{email.sent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: t.textMuted }}>{email.opens} opens</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: 'rgba(74,222,128,0.1)' }}>
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
