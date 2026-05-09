import { useState } from 'react';
import { Search, Calendar, Zap, CreditCard, CheckCircle2, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const mockModerators = [
  { id: 1, name: 'Sarah Wilson',   email: 'sarah@example.com',   pendingAmount: 85000,  lastPaid: '2026-03-28', users: 342, status: 'active'   },
  { id: 2, name: 'Michael Chen',   email: 'michael@example.com', pendingAmount: 127500, lastPaid: '2026-03-28', users: 298, status: 'active'   },
  { id: 3, name: 'Emma Johnson',   email: 'emma@example.com',    pendingAmount: 98000,  lastPaid: '2026-03-28', users: 256, status: 'active'   },
  { id: 4, name: 'James Brown',    email: 'james@example.com',   pendingAmount: 73500,  lastPaid: '2026-03-28', users: 189, status: 'inactive' },
  { id: 5, name: 'Adeola Fashola', email: 'adeola@example.com',  pendingAmount: 112000, lastPaid: '2026-03-28', users: 315, status: 'active'   },
  { id: 6, name: 'Chidi Okafor',   email: 'chidi@example.com',   pendingAmount: 65000,  lastPaid: '2026-03-28', users: 221, status: 'active'   },
];

const fmt = (n: number) => `₦${n.toLocaleString()}`;

export function Payments() {
  const { t } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModerators, setSelectedModerators] = useState<number[]>([]);
  const [paying, setPaying] = useState<number | null>(null);

  const filtered = mockModerators.filter(
    (mod) =>
      mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (id: number) =>
    setSelectedModerators((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const totalSelected = filtered
    .filter((m) => selectedModerators.includes(m.id))
    .reduce((sum, m) => sum + m.pendingAmount, 0);

  const totalPending = mockModerators.reduce((sum, m) => sum + m.pendingAmount, 0);

  const handlePayOne = (id: number) => {
    setPaying(id);
    setTimeout(() => {
      setPaying(null);
      alert('Payment functionality will be enabled after Supabase connection');
    }, 800);
  };

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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '22px', fontWeight: 700 }}>
            Payment Management
          </h2>
          <p className="mt-1 text-sm" style={{ color: t.textMuted }}>
            Process moderator payments and track payout history
          </p>
        </div>
        <button
          onClick={() => alert('Auto-pay all functionality will be enabled after Supabase connection')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
          style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)', color: '#000' }}
        >
          <Zap size={14} />
          <span className="font-semibold text-sm">Auto Pay All Moderators</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Pending',   value: fmt(totalPending),  icon: CreditCard,   color: '#D4A843', bg: 'rgba(212,168,67,0.1)' },
          { label: 'Paid This Month', value: '₦45,230,000',      icon: CheckCircle2, color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
          { label: 'Next Auto-Pay',   value: 'May 1st',          icon: Calendar,     color: '#52A0E0', bg: 'rgba(82,160,224,0.1)' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl p-5" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon size={15} style={{ color: stat.color }} />
                </div>
                <p className="text-xs font-medium" style={{ color: t.textMuted }}>{stat.label}</p>
              </div>
              <p className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: t.text }}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Table card */}
      <div className="rounded-xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        {/* Toolbar */}
        <div className="px-5 py-4 flex flex-wrap items-center gap-3" style={{ borderBottom: `1px solid ${t.borderSub}` }}>
          <div className="relative flex-1" style={{ minWidth: '200px' }}>
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.textFaint }} />
            <input
              type="text"
              placeholder="Search moderators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, width: '100%', paddingLeft: '34px', paddingRight: '14px', paddingTop: '8px', paddingBottom: '8px' }}
            />
          </div>
          {selectedModerators.length > 0 && (
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm" style={{ color: t.textMuted }}>
                Selected: <span style={{ color: '#D4A843', fontWeight: 600 }}>{fmt(totalSelected)}</span>
              </span>
              <button
                onClick={() => alert('Pay selected functionality will be enabled after Supabase connection')}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{ background: 'rgba(212,168,67,0.15)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.25)' }}
              >
                Pay Selected ({selectedModerators.length})
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${t.borderSub}` }}>
                <th className="px-5 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedModerators.length === filtered.length && filtered.length > 0}
                    onChange={(e) => setSelectedModerators(e.target.checked ? filtered.map((m) => m.id) : [])}
                    style={{ accentColor: '#D4A843', cursor: 'pointer' }}
                  />
                </th>
                {['Moderator', 'Users', 'Pending Amount', 'Last Paid', 'Status', 'Action'].map((h) => (
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
                  <td className="px-5 py-4">
                    <input
                      type="checkbox"
                      checked={selectedModerators.includes(mod.id)}
                      onChange={() => toggleSelection(mod.id)}
                      style={{ accentColor: '#D4A843', cursor: 'pointer' }}
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #D4A843, #B8882A)' }}
                      >
                        <span className="text-xs font-bold text-black">{mod.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: t.text }}>{mod.name}</p>
                        <p className="text-xs" style={{ color: t.textMuted }}>{mod.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-medium" style={{ color: t.textSub }}>
                    {mod.users.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold" style={{ color: '#D4A843' }}>{fmt(mod.pendingAmount)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} style={{ color: t.textFaint }} />
                      <span className="text-xs" style={{ color: t.textMuted }}>{mod.lastPaid}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: mod.status === 'active' ? 'rgba(74,222,128,0.1)' : t.surfaceHover,
                        color: mod.status === 'active' ? '#4ade80' : t.textMuted,
                      }}
                    >
                      {mod.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handlePayOne(mod.id)}
                      disabled={paying === mod.id}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: 'rgba(212,168,67,0.12)', color: '#D4A843', border: '1px solid rgba(212,168,67,0.2)' }}
                    >
                      {paying === mod.id ? 'Processing…' : 'Pay Now'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
