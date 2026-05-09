import { Users, ShieldCheck, Mail, TrendingUp, TrendingDown, ArrowUpRight, Zap, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const API_BASE = 'http://localhost:3000';

const statsData = [
  { label: 'Total Users',        value: '12,458',  change: '+12.5%', trend: 'up',   icon: Users,      sub: 'vs last month' },
  { label: 'Active Moderators',  value: '342',     change: '+8.2%',  trend: 'up',   icon: ShieldCheck, sub: 'vs last month' },
  { label: 'Emails Sent',        value: '8,234',   change: '-3.1%',  trend: 'down', icon: Mail,       sub: 'vs last month' },
  { label: 'Total Payouts',      value: '₦45.2M',  change: '+15.3%', trend: 'up',   icon: TrendingUp, sub: 'vs last month' },
];

const userGrowthData = [
  { month: 'Jan', users: 8500 },
  { month: 'Feb', users: 9200 },
  { month: 'Mar', users: 10100 },
  { month: 'Apr', users: 10800 },
  { month: 'May', users: 11500 },
  { month: 'Jun', users: 12458 },
];

const paymentData = [
  { month: 'Jan', amount: 32000000 },
  { month: 'Feb', amount: 35500000 },
  { month: 'Mar', amount: 38200000 },
  { month: 'Apr', amount: 41000000 },
  { month: 'May', amount: 43100000 },
  { month: 'Jun', amount: 45230000 },
];

function CustomTooltip({ active, payload, label }: any) {
  const { t } = useTheme();
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: t.tooltipBg,
        border: `1px solid ${t.tooltipBorder}`,
        borderRadius: '8px',
        padding: '8px 12px',
        color: t.tooltipText,
        fontSize: '12px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
        <p style={{ color: t.tooltipSub, marginBottom: '2px' }}>{label}</p>
        <p style={{ color: '#D4A843', fontWeight: 600 }}>
          {typeof payload[0].value === 'number' && payload[0].value > 10000
            ? `₦${(payload[0].value / 1000000).toFixed(1)}M`
            : payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

export function Dashboard() {
  const { t } = useTheme();



  const [users, setUsers]               = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [total, setTotal]               = useState(0);
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetail, setUserDetail]     = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token  = localStorage.getItem('admin_token');
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') {
        params.append('isVerified', statusFilter === 'active' ? 'true' : 'false');
      }

      const res  = await fetch(`${API_BASE}/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setUsers(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6 min-h-full" style={{ background: t.bg, transition: 'background 0.2s' }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', color: t.text, fontSize: '22px', fontWeight: 700 }}>
            Dashboard Overview
          </h2>
          <p className="mt-1 text-sm" style={{ color: t.textMuted }}>
            Saturday, May 2, 2026 — Welcome back, Admin
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)' }}
        >
          <Activity size={13} style={{ color: '#D4A843' }} />
          <span className="text-xs font-medium" style={{ color: '#D4A843' }}>Live</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {[
          { label: 'Total Users',        value: total.toLocaleString(),   change: '+12.5%', trend: 'up',   icon: Users,      sub: 'vs last month' },
          { label: 'Active Moderators',  value: '342',     change: '+8.2%',  trend: 'up',   icon: ShieldCheck, sub: 'vs last month' },
          { label: 'Emails Sent',        value: '8,234',   change: '-3.1%',  trend: 'down', icon: Mail,       sub: 'vs last month' },
          { label: 'Total Payouts',      value: '₦45.2M',  change: '+15.3%', trend: 'up',   icon: TrendingUp, sub: 'vs last month' },
        ].map((stat) => {
          const Icon = stat.icon;
          const isUp = stat.trend === 'up';
          const TrendIcon = isUp ? TrendingUp : TrendingDown;
          return (
            <div
              key={stat.label}
              className="rounded-xl p-5 relative overflow-hidden"
              style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s, border-color 0.2s' }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2"
                style={{ background: '#D4A843', filter: 'blur(20px)' }} />
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(212,168,67,0.1)' }}>
                  <Icon size={16} style={{ color: '#D4A843' }} />
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    background: isUp ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                    color: isUp ? '#4ade80' : '#f87171',
                  }}
                >
                  <TrendIcon size={10} />
                  <span>{stat.change}</span>
                </div>
              </div>
              <p className="text-xs font-medium mb-1" style={{ color: t.textMuted }}>{stat.label}</p>
              <p className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: t.text }}>{stat.value}</p>
              <p className="text-xs mt-1" style={{ color: t.textFaint }}>{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl p-5" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm" style={{ color: t.text }}>User Growth</h3>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#4ade80' }}>
              <ArrowUpRight size={13} />
              <span>+46.5%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#D4A843" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D4A843" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={{ fontSize: 11, fill: t.chartTick }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fontSize: 11, fill: t.chartTick }} axisLine={false} tickLine={false} width={45} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" stroke="#D4A843" strokeWidth={2} fill="url(#userGradient)" dot={false} activeDot={{ r: 4, fill: '#D4A843', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl p-5" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-sm" style={{ color: t.text }}>Payment Trends</h3>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Monthly payouts in ₦</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#4ade80' }}>
              <ArrowUpRight size={13} />
              <span>+41.3%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={paymentData} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke={t.chartGrid} vertical={false} />
              <XAxis dataKey="month" stroke="transparent" tick={{ fontSize: 11, fill: t.chartTick }} axisLine={false} tickLine={false} />
              <YAxis stroke="transparent" tick={{ fontSize: 11, fill: t.chartTick }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => `₦${(v / 1000000).toFixed(0)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#D4A843" radius={[5, 5, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl p-5" style={{ background: t.surface, border: `1px solid ${t.border}`, transition: 'background 0.2s' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-sm" style={{ color: t.text }}>Recent Activity</h3>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md cursor-pointer"
            style={{ background: t.surfaceHover }}
          >
            <Zap size={11} style={{ color: '#D4A843' }} />
            <span className="text-xs" style={{ color: t.textMuted }}>View all</span>
          </div>
        </div>
        <div className="space-y-1">
          {[
            { action: 'Bulk email sent to 1,234 users',                     time: '5 minutes ago',  color: '#52A0E0' },
            { action: 'Payment processed for moderator John Doe — ₦85,000', time: '12 minutes ago', color: '#D4A843' },
            { action: 'New moderator Sarah Wilson onboarded',               time: '1 hour ago',     color: '#52C4A0' },
            { action: '45 offline users successfully imported',             time: '2 hours ago',    color: '#A052E0' },
            { action: 'Auto-pay cycle completed for 342 moderators',        time: '3 hours ago',    color: '#D4A843' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ background: index % 2 === 0 ? t.tableStripe : 'transparent' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: activity.color }} />
                <p className="text-sm" style={{ color: t.textSub }}>{activity.action}</p>
              </div>
              <span className="text-xs flex-shrink-0 ml-4" style={{ color: t.textFaint }}>{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
