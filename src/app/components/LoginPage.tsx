import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import presidyLogo from '../../imports/presidy.jpg';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
      try{
        const response = await fetch('',{
          method:'POST',
          headers: {'Content-Type':'application/json'},
          body:JSON.stringify({email,password})
        });

        const data = await response.json();

        if(!response.ok){
          setError(data.message || 'Invalid Credential')
          return
        }

        localStorage.setItem('admin_token', data.accessToken);
        onLogin()
      }catch(err){
        setError('Unable to connect to server. Try again');
      }finally{
        setLoading(false)
      }
  };

  return (
    <div
      className="size-full flex"
      style={{ background: '#080809', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Left panel: visual / brand ── */}
      <div
        className="hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col relative overflow-hidden"
        style={{ background: '#0A0A0C' }}
      >
        {/* Background image with overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1761437855740-c894da924d79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwYWJzdHJhY3QlMjBnZW9tZXRyaWMlMjBsdXh0cnklMjBiYWNrZ3JvdW5kfGVufDF8fHx8MTc3NzU0Mzg5OHww&ixlib=rb-4.1.0&q=80&w=1080)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.18,
          }}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(212,168,67,0.08) 0%, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ background: 'linear-gradient(to top, #0A0A0C, transparent)' }} />

        {/* Decorative orbs */}
        <div
          className="absolute rounded-full"
          style={{
            width: '500px', height: '500px',
            background: 'radial-gradient(circle, rgba(212,168,67,0.07) 0%, transparent 70%)',
            top: '-100px', left: '-100px',
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(212,168,67,0.05) 0%, transparent 70%)',
            bottom: '100px', right: '-50px',
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo — large standalone mark */}
          <div className="flex flex-col gap-3">
            <div
              className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ boxShadow: '0 0 0 1px rgba(212,168,67,0.2), 0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <img src={presidyLogo} alt="Presidy" className="w-full h-full object-cover" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '19px', color: '#F2F2F2', letterSpacing: '-0.02em' }}>
              Presidy
            </span>
          </div>

          {/* Middle content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
              style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.2)', width: 'fit-content' }}
            >
              <ShieldCheck size={12} style={{ color: '#D4A843' }} />
              <span className="text-xs font-medium" style={{ color: '#D4A843' }}>Admin Access Portal</span>
            </div>

            <h1
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: '42px',
                fontWeight: 800,
                lineHeight: 1.15,
                color: '#F2F2F2',
                letterSpacing: '-0.03em',
              }}
            >
              Manage your<br />
              <span style={{ color: '#D4A843' }}>platform</span><br />
              with clarity.
            </h1>

            <p className="mt-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)', maxWidth: '360px' }}>
              The Presidy Admin Console gives you complete control over users, moderators, payments, and communications — all in one place.
            </p>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center gap-6">
            {[
              { value: '12,458', label: 'Users' },
              { value: '342', label: 'Moderators' },
              { value: '₦45.2M', label: 'Paid Out' },
            ].map((stat, i) => (
              <div key={stat.label}>
                <p
                  style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '20px', color: '#F2F2F2' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{stat.label}</p>
                {i < 2 && (
                  <div className="hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel: login form ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ background: '#080809' }}
      >
        {/* Subtle top-right glow */}
        <div
          className="absolute top-0 right-0 pointer-events-none"
          style={{
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(212,168,67,0.04) 0%, transparent 70%)',
          }}
        />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div
              className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
              style={{ boxShadow: '0 0 0 1px rgba(212,168,67,0.2), 0 4px 16px rgba(0,0,0,0.4)' }}
            >
              <img src={presidyLogo} alt="Presidy" className="w-full h-full object-cover" />
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '17px', color: '#F2F2F2' }}>Presidy</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 700, color: '#F2F2F2', letterSpacing: '-0.02em' }}
            >
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium mb-2"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="admin@presidy.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: focusedField === 'email' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${focusedField === 'email' ? 'rgba(212,168,67,0.45)' : 'rgba(255,255,255,0.09)'}`,
                  borderRadius: '10px',
                  color: '#F2F2F2',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.15s',
                }}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium"
                  style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}
                >
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs transition-opacity hover:opacity-70"
                  style={{ color: '#D4A843' }}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 16px',
                    background: focusedField === 'password' ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focusedField === 'password' ? 'rgba(212,168,67,0.45)' : 'rgba(255,255,255,0.09)'}`,
                    borderRadius: '10px',
                    color: '#F2F2F2',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'all 0.15s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.2)', color: '#f87171' }}
              >
                <span className="text-xs">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-70 mt-2"
              style={{
                background: loading ? 'rgba(212,168,67,0.7)' : 'linear-gradient(135deg, #D4A843 0%, #C49830 50%, #B8882A 100%)',
                color: '#000',
                boxShadow: loading ? 'none' : '0 0 24px rgba(212,168,67,0.2)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign in to Dashboard</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>secured access</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Security note */}
          <div
            className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <ShieldCheck size={14} style={{ color: '#D4A843', flexShrink: 0, marginTop: '1px' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
              This portal is restricted to authorised Presidy administrators only. All sessions are logged and monitored.
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs mt-8" style={{ color: 'rgba(255,255,255,0.18)' }}>
            © 2026 Presidy · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}